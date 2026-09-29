import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Trash2, Mail, Phone, Calendar, User, Upload, Edit2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [activeTab, setActiveTab] = useState('curriculum');
  const [students, setStudents] = useState([]);

  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // Chapter Form State
  const [newChapter, setNewChapter] = useState({ title: '', chapterNumber: '' });
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editChapterForm, setEditChapterForm] = useState({ title: '', chapterNumber: '' });

  // Question Form State
  const [newQuestion, setNewQuestion] = useState({
    type: 'MCQ',
    questionText: '',
    answerText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: null
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionForm, setEditQuestionForm] = useState({
    type: 'MCQ',
    questionText: '',
    answerText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: null,
    imageUrl: '',
    answerImageUrl: ''
  });
  const [questionFilter, setQuestionFilter] = useState('All');

  const fileInputRef = useRef(null);

  const formatText = (text) => {
    if (typeof text !== 'string') return text;
    const cleanedText = text.replace(/-\s*\*\*/g, '**');
    const parts = cleanedText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      return <Latex key={i}>{part}</Latex>;
    });
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (role !== 'admin' || !token) {
      navigate('/portal');
      return;
    }
    fetchBoards();
    fetchStudents();
  }, [navigate]);

  const fetchBoards = async () => {
    const res = await api.get('/public/boards');
    setBoards(res.data);
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      toast.error('Failed to fetch students');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      toast.success('Student removed successfully');
      setStudents(students.filter(s => s._id !== id));
    } catch (err) {
      toast.error('Failed to remove student');
    }
  };

  const fetchClasses = async (boardId) => {
    const res = await api.get(`/public/boards/${boardId}/classes`);
    setClasses(res.data);
    setSubjects([]); setChapters([]); setQuestions([]);
    setSelectedClass(''); setSelectedSubject(''); setSelectedChapter('');
  };

  const fetchSubjects = async (classId) => {
    const res = await api.get(`/public/classes/${classId}/subjects`);
    setSubjects(res.data);
    setChapters([]); setQuestions([]);
    setSelectedSubject(''); setSelectedChapter('');
  };

  const fetchChapters = async (subjectId) => {
    const res = await api.get(`/public/subjects/${subjectId}/chapters`);
    setChapters(res.data);
    setQuestions([]);
    setSelectedChapter('');
  };

  const fetchQuestions = async (chapterId) => {
    const res = await api.get(`/public/chapters/${chapterId}/questions`);
    setQuestions(res.data);
  };

  // Handlers
  const handleBoardChange = (e) => {
    setSelectedBoard(e.target.value);
    if (e.target.value) fetchClasses(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    if (e.target.value) fetchSubjects(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    if (e.target.value) fetchChapters(e.target.value);
  };

  const handleChapterSelect = (chapterId) => {
    setSelectedChapter(chapterId);
    if (chapterId) fetchQuestions(chapterId);
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/chapters', {
        title: newChapter.title,
        chapterNumber: newChapter.chapterNumber,
        subjectId: selectedSubject
      });
      setNewChapter({ title: '', chapterNumber: '' });
      fetchChapters(selectedSubject);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error creating chapter');
      console.error(err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: newQuestion.type,
        questionText: newQuestion.questionText,
        chapterId: selectedChapter
      };

      if (newQuestion.type === 'MCQ') {
        payload.options = newQuestion.options.filter(opt => opt.trim() !== '');
        if (payload.options.length < 2 || newQuestion.correctAnswerIndex === null) {
          return alert('MCQs require at least 2 options and a selected correct answer.');
        }
        payload.correctAnswer = newQuestion.options[newQuestion.correctAnswerIndex];
      } else {
        payload.correctAnswer = newQuestion.answerText;
      }

      await api.post('/admin/questions', payload);
      setNewQuestion({ type: 'MCQ', questionText: '', answerText: '', options: ['', '', '', ''], correctAnswerIndex: null });
      fetchQuestions(selectedChapter);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error creating question');
      console.error(err);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!Array.isArray(json)) throw new Error('File must contain a JSON array of objects');

        const questionsToAdd = json.map(q => {
          const type = newQuestion.type;
          const questionText = q.questionText || q.question;
          const correctAnswer = q.correctAnswer || q.answer;

          if (type === 'MCQ') {
            return { ...q, questionText, correctAnswer, chapterId: selectedChapter, type };
          } else {
            return { questionText, correctAnswer, chapterId: selectedChapter, type };
          }
        });

        await api.post('/admin/questions/bulk', questionsToAdd);
        toast.success(`Successfully added ${questionsToAdd.length} ${newQuestion.type} questions!`);
        fetchQuestions(selectedChapter);
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse or upload JSON. Ensure the format is correct.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input so the same file can be uploaded again if needed
  };

  const handleEditChapterClick = (ch, e) => {
    e.stopPropagation();
    setEditingChapterId(ch._id);
    setEditChapterForm({ title: ch.title, chapterNumber: ch.chapterNumber });
  };

  const handleUpdateChapter = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/chapters/${editingChapterId}`, editChapterForm);
      setEditingChapterId(null);
      fetchChapters(selectedSubject);
      toast.success('Chapter updated');
    } catch (err) {
      toast.error('Error updating chapter');
    }
  };

  const handleDeleteChapter = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chapter?')) return;
    try {
      await api.delete(`/admin/chapters/${id}`);
      if (selectedChapter === id) {
        setSelectedChapter('');
        setQuestions([]);
      }
      fetchChapters(selectedSubject);
      toast.success('Chapter deleted');
    } catch (err) {
      toast.error('Error deleting chapter');
    }
  };

  const handleClearQuestions = async (type = null) => {
    const confirmMessage = type 
      ? `Are you sure you want to clear all ${type} questions in this chapter?` 
      : 'Are you sure you want to clear all questions in this chapter?';
    
    if (!window.confirm(confirmMessage)) return;
    try {
      const url = type 
        ? `/admin/chapters/${selectedChapter}/questions?type=${type}`
        : `/admin/chapters/${selectedChapter}/questions`;
      await api.delete(url);
      fetchQuestions(selectedChapter);
      toast.success(type ? `All ${type} questions cleared` : 'All questions cleared');
    } catch (err) {
      toast.error('Error clearing questions');
    }
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading("Uploading image...");
    try {
      const res = await api.post('/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.secure_url) {
        setEditQuestionForm({ ...editQuestionForm, imageUrl: res.data.secure_url });
        toast.update(toastId, { render: "Image uploaded successfully!", type: "success", isLoading: false, autoClose: 2000 });
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.error || "Image upload failed", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleEditAnswerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading("Uploading answer image...");
    try {
      const res = await api.post('/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.secure_url) {
        setEditQuestionForm({ ...editQuestionForm, answerImageUrl: res.data.secure_url });
        toast.update(toastId, { render: "Answer image uploaded successfully!", type: "success", isLoading: false, autoClose: 2000 });
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.error || "Image upload failed", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleEditQuestionClick = (q) => {
    setEditingQuestionId(q._id);
    let correctIdx = null;
    if (q.type === 'MCQ' && q.options) {
      correctIdx = q.options.indexOf(q.correctAnswer);
    }
    setEditQuestionForm({
      type: q.type,
      questionText: q.questionText,
      answerText: (q.type !== 'MCQ') ? q.correctAnswer || '' : '',
      options: q.options || ['', '', '', ''],
      correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
      imageUrl: q.imageUrl || '',
      answerImageUrl: q.answerImageUrl || ''
    });
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: editQuestionForm.type,
        questionText: editQuestionForm.questionText,
        chapterId: selectedChapter,
        imageUrl: editQuestionForm.imageUrl,
        answerImageUrl: editQuestionForm.answerImageUrl
      };

      if (editQuestionForm.type === 'MCQ') {
        payload.options = editQuestionForm.options.filter(opt => opt.trim() !== '');
        if (payload.options.length < 2 || editQuestionForm.correctAnswerIndex === null) {
          return toast.error('MCQs require at least 2 options and a selected correct answer.');
        }
        payload.correctAnswer = editQuestionForm.options[editQuestionForm.correctAnswerIndex];
      } else {
        payload.correctAnswer = editQuestionForm.answerText;
      }

      await api.put(`/admin/questions/${editingQuestionId}`, payload);
      setEditingQuestionId(null);
      fetchQuestions(selectedChapter);
      toast.success('Question updated');
    } catch (err) {
      toast.error('Error updating question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      fetchQuestions(selectedChapter);
      toast.success('Question deleted');
    } catch (err) {
      toast.error('Error deleting question');
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-2">
      <div className="flex items-center justify-between mb-0">
        <h1 className="text-lg font-bold text-emerald-400">Admin Dashboard</h1>
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button
          className={`flex items-center gap-1.5 px-3 py-1 font-semibold text-xs rounded-t-md transition-colors ${activeTab === 'curriculum' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          onClick={() => setActiveTab('curriculum')}
        >
          <BookOpen size={14} /> Curriculum Management
        </button>
        <button
          className={`flex items-center gap-1.5 px-3 py-1 font-semibold text-xs rounded-t-md transition-colors ${activeTab === 'students' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={14} /> Enrolled Students
        </button>
      </div>

      {activeTab === 'curriculum' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            {/* Breadcrumb Path */}
            <div className="text-xs text-slate-400 font-medium flex flex-wrap items-center gap-1 bg-slate-900/50 p-2 rounded-md border border-slate-700/50">
              <span className="text-slate-500">Path:</span>
              {selectedBoard ? (
                <span className="text-slate-200">{boards.find(b => b._id === selectedBoard)?.name}</span>
              ) : (
                <span className="text-slate-500 italic">No selection</span>
              )}
              {selectedClass && (
                <>
                  <span className="text-rose-500/50">/</span>
                  <span className="text-slate-200">{classes.find(c => c._id === selectedClass)?.gradeLevel}th Class</span>
                </>
              )}
              {selectedSubject && (
                <>
                  <span className="text-rose-500/50">/</span>
                  <span className="text-slate-200">{subjects.find(s => s._id === selectedSubject)?.name}</span>
                </>
              )}
              {selectedChapter && (
                <>
                  <span className="text-rose-500/50">/</span>
                  <span className="text-rose-400">Ch {chapters.find(c => c._id === selectedChapter)?.chapterNumber}</span>
                </>
              )}
            </div>
          </div>

          {/* Target Selector */}
          <div className="glass-panel p-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Board</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white focus:border-emerald-500 outline-none transition-all" value={selectedBoard} onChange={handleBoardChange}>
                <option value="">Select Board</option>
                {boards.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Class</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white focus:border-emerald-500 outline-none transition-all" value={selectedClass} onChange={handleClassChange} disabled={!selectedBoard}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.gradeLevel}th</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Subject</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white focus:border-emerald-500 outline-none transition-all" value={selectedSubject} onChange={handleSubjectChange} disabled={!selectedClass}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Main Panes */}
          {selectedSubject && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* Chapter Pane */}
              <div className="glass-panel p-3 flex flex-col gap-2 shadow-lg">
                <h2 className="text-base font-semibold border-b border-slate-800 pb-1 flex items-center gap-1.5">
                  <BookOpen className="text-emerald-400" size={16} /> Chapters
                </h2>

                <form onSubmit={handleAddChapter} className="flex gap-1.5">
                  <input type="number" required placeholder="No." className="w-12 bg-slate-900 border border-slate-700 rounded p-1 text-xs focus:border-sky-500 outline-none transition-all" value={newChapter.chapterNumber} onChange={e => setNewChapter({ ...newChapter, chapterNumber: e.target.value })} />
                  <input type="text" required placeholder="Chapter Title" className="flex-1 bg-slate-900 border border-slate-700 rounded p-1 text-xs focus:border-sky-500 outline-none transition-all" value={newChapter.title} onChange={e => setNewChapter({ ...newChapter, title: e.target.value })} />
                  <button type="submit" className="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded text-xs font-bold text-white shadow-md transition-colors">Add</button>
                </form>

                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {chapters.map(ch => (
                    editingChapterId === ch._id ? (
                      <form key={ch._id} onSubmit={handleUpdateChapter} className="p-3 rounded-lg border bg-slate-800 border-slate-700 flex items-center gap-2">
                        <input type="number" required className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-sm outline-none text-white" value={editChapterForm.chapterNumber} onChange={e => setEditChapterForm({ ...editChapterForm, chapterNumber: e.target.value })} />
                        <input type="text" required className="flex-1 bg-slate-900 border border-slate-700 rounded p-1 text-sm outline-none text-white" value={editChapterForm.title} onChange={e => setEditChapterForm({ ...editChapterForm, title: e.target.value })} />
                        <button type="submit" className="text-emerald-400 hover:text-emerald-300" title="Save"><Edit2 size={16} /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setEditingChapterId(null); }} className="text-slate-400 hover:text-white" title="Cancel"><X size={16} /></button>
                      </form>
                    ) : (
                      <div
                        key={ch._id}
                        onClick={() => handleChapterSelect(ch._id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-2 group ${selectedChapter === ch._id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
                      >
                        <span className="font-bold text-emerald-400 min-w-[3rem]">Ch {ch.chapterNumber}:</span>
                        <span className="text-slate-200 truncate flex-1">{ch.title}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                          <button onClick={(e) => handleEditChapterClick(ch, e)} className="text-slate-400 hover:text-emerald-400 p-1" title="Edit"><Edit2 size={16} /></button>
                          <button onClick={(e) => handleDeleteChapter(ch._id, e)} className="text-slate-400 hover:text-rose-400 p-1" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    )
                  ))}
                  {chapters.length === 0 && <p className="text-slate-500 text-center py-4">No chapters yet</p>}
                </div>
              </div>

              {/* Questions Pane */}
              {selectedChapter ? (
                <div className="glass-panel p-3 flex flex-col gap-2 shadow-lg border-t-4 border-t-sky-500">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <h2 className="text-base font-semibold">Questions</h2>
                    <div className="flex items-center gap-1.5">
                      <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
                        {['All', 'MCQ', 'Short', 'Long'].map(type => (
                          <button
                            key={type}
                            onClick={() => setQuestionFilter(type)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all shadow-sm ${questionFilter === type ? 'bg-sky-600 text-white scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      {questions.length > 0 && (
                        <button 
                          onClick={() => handleClearQuestions(questionFilter === 'All' ? null : questionFilter)} 
                          className="text-xs flex items-center gap-1 text-white hover:text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-md shadow-md font-bold transition-colors ml-2"
                        >
                          <Trash2 size={14} /> 
                          {questionFilter === 'All' ? 'Clear All' : `Clear ${questionFilter}s`}
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleAddQuestion} className="flex flex-col gap-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <div className="flex gap-2">
                      <select className="bg-slate-900 border border-slate-700 rounded p-1 text-sm focus:border-emerald-500 outline-none" value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}>
                        <option value="MCQ">MCQ</option>
                        <option value="Short">Short</option>
                        <option value="Long">Long</option>
                      </select>
                      <input type="text" required placeholder="Enter question text..." className="flex-1 bg-slate-900 border border-slate-700 rounded p-1 text-sm focus:border-emerald-500 outline-none" value={newQuestion.questionText} onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })} />
                    </div>

                    {newQuestion.type === 'MCQ' && (
                      <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-slate-700 mt-1">
                        <label className="text-[11px] text-slate-400 font-medium">Options (Select radio for Correct Answer)</label>
                        {newQuestion.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input type="radio" name="correctAnswer" required className="accent-emerald-500 w-3 h-3 cursor-pointer" checked={newQuestion.correctAnswerIndex === idx} onChange={() => setNewQuestion({ ...newQuestion, correctAnswerIndex: idx })} />
                            <input type="text" placeholder={`Option ${idx + 1}`} className="flex-1 bg-slate-900 border border-slate-700 rounded p-1 text-xs focus:border-emerald-500 outline-none" value={opt} onChange={e => handleOptionChange(idx, e.target.value)} />
                          </div>
                        ))}
                      </div>
                    )}
                    {newQuestion.type !== 'MCQ' && (
                      <textarea required placeholder="Enter answer text..." rows="2" className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm focus:border-emerald-500 outline-none mt-1 text-white" value={newQuestion.answerText} onChange={e => setNewQuestion({ ...newQuestion, answerText: e.target.value })}></textarea>
                    )}

                    <div className="flex gap-2 mt-1">
                      <button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-500 py-1.5 rounded text-sm font-bold text-white shadow-md transition-colors">
                        Add Question
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-500 py-1.5 px-3 rounded text-sm font-bold text-white shadow-md transition-colors"
                        title="Upload JSON file with questions"
                      >
                        <Upload size={14} /> Bulk Upload
                      </button>
                      <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </div>
                  </form>

                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {(questionFilter === 'All' ? questions : questions.filter(q => q.type === questionFilter)).map(q => (
                      editingQuestionId === q._id ? (
                        <form key={q._id} onSubmit={handleUpdateQuestion} className="p-4 rounded-xl bg-slate-800 border border-emerald-500 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-emerald-400">Editing Question</span>
                            <button type="button" onClick={() => setEditingQuestionId(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                          </div>
                          <div className="flex gap-2">
                            <select className="bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none text-white" value={editQuestionForm.type} onChange={e => setEditQuestionForm({ ...editQuestionForm, type: e.target.value })}>
                              <option value="MCQ">MCQ</option>
                              <option value="Short">Short</option>
                              <option value="Long">Long</option>
                            </select>
                            <input type="text" required className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none text-white" value={editQuestionForm.questionText} onChange={e => setEditQuestionForm({ ...editQuestionForm, questionText: e.target.value })} />
                          </div>
                          {editQuestionForm.type === 'MCQ' && (
                            <div className="flex flex-col gap-2 pl-2 border-l border-slate-700 ml-1">
                              {editQuestionForm.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <input type="radio" name="editCorrectAnswer" required className="accent-emerald-500" checked={editQuestionForm.correctAnswerIndex === idx} onChange={() => setEditQuestionForm({ ...editQuestionForm, correctAnswerIndex: idx })} />
                                  <input type="text" placeholder={`Option ${idx + 1}`} className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-sm outline-none text-white" value={opt} onChange={e => {
                                    const newOpts = [...editQuestionForm.options];
                                    newOpts[idx] = e.target.value;
                                    setEditQuestionForm({ ...editQuestionForm, options: newOpts });
                                  }} />
                                </div>
                              ))}
                            </div>
                          )}
                          {editQuestionForm.type !== 'MCQ' && (
                            <textarea required placeholder="Enter answer text..." rows="3" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none text-white" value={editQuestionForm.answerText} onChange={e => setEditQuestionForm({ ...editQuestionForm, answerText: e.target.value })}></textarea>
                          )}
                          <div className="flex flex-col gap-2 mt-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <label className="text-xs text-slate-400 font-medium">Attach Question Diagram / Image (Optional)</label>
                            <input type="file" accept="image/*" onChange={handleEditImageUpload} className="text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer" />
                            {editQuestionForm.imageUrl && (
                              <div className="relative mt-2 self-start group">
                                <img src={editQuestionForm.imageUrl} alt="Preview" className="h-24 rounded-lg object-contain bg-slate-900 border border-slate-700" />
                                <button type="button" onClick={() => setEditQuestionForm({ ...editQuestionForm, imageUrl: '' })} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                              </div>
                            )}
                          </div>
                          {editQuestionForm.type !== 'MCQ' && (
                            <div className="flex flex-col gap-2 mt-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                              <label className="text-xs text-slate-400 font-medium">Attach Answer Diagram / Image (Optional)</label>
                              <input type="file" accept="image/*" onChange={handleEditAnswerImageUpload} className="text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer" />
                              {editQuestionForm.answerImageUrl && (
                                <div className="relative mt-2 self-start group">
                                  <img src={editQuestionForm.answerImageUrl} alt="Answer Preview" className="h-24 rounded-lg object-contain bg-slate-900 border border-slate-700" />
                                  <button type="button" onClick={() => setEditQuestionForm({ ...editQuestionForm, answerImageUrl: '' })} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                </div>
                              )}
                            </div>
                          )}
                          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded text-sm font-bold text-white mt-1">Save Changes</button>
                        </form>
                      ) : (
                        <div key={q._id} className="p-4 rounded-xl bg-slate-800 border border-slate-700 shadow-sm group">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-full text-slate-300 shadow-inner">{q.type}</span>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                              <button onClick={() => handleEditQuestionClick(q)} className="text-slate-400 hover:text-emerald-400 p-1" title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteQuestion(q._id)} className="text-slate-400 hover:text-rose-400 p-1" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </div>
                          {q.imageUrl && (
                            <div className="mb-3">
                              <img src={q.imageUrl} alt="Question Diagram" className="max-h-32 rounded-lg object-contain border border-slate-700" />
                            </div>
                          )}
                          <p className="text-sm font-medium mb-3 text-slate-200">{formatText(q.questionText)}</p>
                          {q.type === 'MCQ' && (
                            <ul className="text-xs space-y-2 bg-slate-900/50 p-3 rounded-lg">
                              {q.options.map((opt, idx) => (
                                <li key={idx} className={`flex items-center gap-2 ${q.correctAnswer === opt ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${q.correctAnswer === opt ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                                  {formatText(opt)}
                                </li>
                              ))}
                            </ul>
                          )}
                          {q.type !== 'MCQ' && q.correctAnswer && (
                            <div className="text-xs bg-slate-900/50 p-3 rounded-lg text-slate-300">
                              <span className="font-bold text-emerald-400 block mb-1">Answer:</span>
                              {q.answerImageUrl && (
                                <div className="mb-2">
                                  <img src={q.answerImageUrl} alt="Answer Diagram" className="max-h-24 rounded object-contain border border-slate-700" />
                                </div>
                              )}
                              {formatText(q.correctAnswer)}
                            </div>
                          )}
                        </div>
                      )
                    ))}
                    {questions.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No questions yet</p>
                    ) : (
                      (questionFilter === 'All' ? questions : questions.filter(q => q.type === questionFilter)).length === 0 && (
                        <p className="text-slate-500 text-center py-4">No {questionFilter} questions found</p>
                      )
                    )}
                  </div>

                </div>
              ) : (
                <div className="glass-panel p-6 flex flex-col items-center justify-center h-full text-slate-500 border-dashed border-2 border-slate-700/50 min-h-[300px]">
                  <BookOpen size={48} className="mb-4 text-slate-700" />
                  <p className="font-medium">Select a chapter to manage questions</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="glass-panel p-6 overflow-hidden">
            <h2 className="text-lg font-semibold border-b border-slate-800 pb-4 mb-4 flex items-center gap-2">
              <Users className="text-emerald-400" size={20} /> Enrolled Students
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-700">
                    <th className="p-4 font-semibold rounded-tl-lg">Student</th>
                    <th className="p-4 font-semibold">Contact Info</th>
                    <th className="p-4 font-semibold">Demographics</th>
                    <th className="p-4 font-semibold rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                            {student.image ? (
                              <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <User size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{student.name}</div>
                            <div className="text-xs text-slate-500">Joined {new Date(student.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-slate-500" />
                            <a href={`mailto:${student.email}`} className="hover:text-emerald-400 transition-colors">{student.email}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-500" />
                            <span>{student.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-500" />
                            <span>{student.age ? `${student.age} years old` : 'Age N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-500" />
                            <span>{student.gender || 'Gender N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
                          className="p-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500 transition-colors"
                          title="Remove Student"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">
                        <Users size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No enrolled students found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
