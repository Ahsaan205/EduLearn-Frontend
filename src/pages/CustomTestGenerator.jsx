import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Settings, Printer, Download, BookOpen, CheckSquare, Layers, Calendar, Clock, PenTool } from 'lucide-react';
import { toast } from 'react-toastify';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

const cleanPrefix = (text, isOption = false) => {
  if (!text) return '';
  let cleaned = text.trim();
  if (isOption) {
    // Remove "A.", "B)", "a.", "b)", "A)", "a)" from options
    cleaned = cleaned.replace(/^[a-zA-Z][.)]\s*/, '');
  } else {
    // Remove "Q1.", "Q 1.", "1.", "1)", "Q12:" from questions
    cleaned = cleaned.replace(/^(Q\s*\d+|\d+)[.)]?\s*/i, '');
    // Also remove leading dashes if any
    cleaned = cleaned.replace(/^-\s*/, '');
  }
  return cleaned;
};

export default function CustomTestGenerator() {
  const navigate = useNavigate();

  // Selections
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState([]);

  // Configuration
  const [counts, setCounts] = useState({ MCQ: 10, Short: 5, Long: 2 });
  const [marks, setMarks] = useState({ MCQ: 1, Short: 3, Long: 5 });

  // Metadata
  const [testMetadata, setTestMetadata] = useState({
    title: 'Custom Subject Test',
    timeAllowed: '45 Minutes',
    date: new Date().toISOString().split('T')[0],
    totalMarks: ''
  });

  const [loading, setLoading] = useState(true);
  const [generatedTest, setGeneratedTest] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [availableCounts, setAvailableCounts] = useState({ MCQ: 0, Short: 0, Long: 0 });

  useEffect(() => {
    const total = (counts.MCQ * marks.MCQ) + (counts.Short * marks.Short) + (counts.Long * marks.Long);
    setTestMetadata(prev => ({ ...prev, totalMarks: total.toString() }));
  }, [counts, marks]);

  // Fetch Boards on Mount
  useEffect(() => {
    api.get('/public/boards')
      .then(res => {
        setBoards(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch Classes when Board changes
  useEffect(() => {
    if (!selectedBoard) {
      setClasses([]); setSelectedClass(''); setSubjects([]); setSelectedSubject(''); setChapters([]); setSelectedChapters([]); return;
    }
    api.get(`/public/boards/${selectedBoard}/classes`).then(res => setClasses(res.data));
  }, [selectedBoard]);

  // Fetch Subjects when Class changes
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]); setSelectedSubject(''); setChapters([]); setSelectedChapters([]); return;
    }
    api.get(`/public/classes/${selectedClass}/subjects`).then(res => setSubjects(res.data));
  }, [selectedClass]);

  // Fetch Chapters when Subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]); setSelectedChapters([]); return;
    }
    api.get(`/public/subjects/${selectedSubject}/chapters`).then(res => setChapters(res.data));
  }, [selectedSubject]);

  // Fetch available questions count when Selected Chapters change
  useEffect(() => {
    const fetchQuestionCounts = async () => {
      if (selectedChapters.length === 0) {
        setAvailableCounts({ MCQ: 0, Short: 0, Long: 0 });
        return;
      }
      try {
        let mcq = 0, short = 0, long = 0;
        const promises = selectedChapters.map(id => api.get(`/public/chapters/${id}/questions`));
        const results = await Promise.all(promises);
        results.forEach(res => {
          const questions = res.data || [];
          questions.forEach(q => {
            if (q.type === 'MCQ') mcq++;
            else if (q.type === 'Short') short++;
            else if (q.type === 'Long') long++;
          });
        });
        setAvailableCounts({ MCQ: mcq, Short: short, Long: long });
      } catch (err) {
        console.error("Error fetching question counts", err);
      }
    };
    fetchQuestionCounts();
  }, [selectedChapters]);

  const handleChapterToggle = (id) => {
    if (selectedChapters.includes(id)) {
      setSelectedChapters(selectedChapters.filter(c => c !== id));
    } else {
      setSelectedChapters([...selectedChapters, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(chapters.map(c => c._id));
    }
  };

  const handleCountChange = (type, val) => {
    const value = Math.max(0, parseInt(val) || 0);
    setCounts(prev => ({ ...prev, [type]: value }));
  };

  const handleMarksChange = (type, val) => {
    const value = Math.max(0, parseFloat(val) || 0);
    setMarks(prev => ({ ...prev, [type]: value }));
  };

  const calculateAutoTotal = () => {
    return (counts.MCQ * marks.MCQ) + (counts.Short * marks.Short) + (counts.Long * marks.Long);
  };

  const handleGenerate = async () => {
    if (selectedChapters.length === 0) {
      return toast.error("Please select at least one chapter.");
    }
    if (counts.MCQ === 0 && counts.Short === 0 && counts.Long === 0) {
      return toast.error("Please select at least one question to generate.");
    }

    setIsGenerating(true);
    try {
      const res = await api.post('/public/generate-test', {
        chapterIds: selectedChapters,
        mcqCount: counts.MCQ,
        shortCount: counts.Short,
        longCount: counts.Long
      });
      setGeneratedTest(res.data);
      toast.success("Test generated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error generating test");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Custom Test Paper</title></head><body>";
    const footer = "</body></html>";
    const content = document.getElementById('printable-test').innerHTML;
    const html = header + content + footer;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${testMetadata.title ? testMetadata.title.replace(/\s+/g, '_') : 'Custom_Test'}.doc`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-20 animate-pulse">Loading Test Generator...</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4 print:m-0 print:p-0 print:max-w-none print:w-full">

      {/* Configuration Section */}
      {!generatedTest && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-0">
            <h1 className="text-2xl font-bold text-black bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center gap-2">
              <Settings className="w-6 h-6 text-emerald-400" /> Global Test Generator
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Select your curriculum and build custom exam papers instantly.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left Column: Selection */}
            <div className="flex flex-col gap-4">
              <div className="glass-panel p-4 shadow-lg border border-slate-700/50">
                <h2 className="text-base font-bold flex items-center gap-1.5 text-slate-200 mb-3 border-b border-slate-700/50 pb-2">
                  <BookOpen className="text-emerald-400" size={18} /> Select Curriculum
                </h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Board</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white focus:border-emerald-500 outline-none transition-all" value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)}>
                      <option value="">Select Board</option>
                      {boards.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Class</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white focus:border-emerald-500 outline-none transition-all" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedBoard}>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c._id} value={c._id}>{c.gradeLevel}th</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Subject</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white focus:border-emerald-500 outline-none transition-all" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedClass}>
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {selectedSubject && (
                <div className="glass-panel p-4 shadow-lg border border-slate-700/50">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-700/50 pb-2">
                    <h2 className="text-base font-bold flex items-center gap-1.5 text-slate-200">
                      <BookOpen className="text-emerald-400" size={18} /> Select Chapters
                    </h2>
                    <button onClick={handleSelectAll} className="text-[11px] text-black hover:font-bold font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                      {selectedChapters.length === chapters.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                    {chapters.map(ch => (
                      <label key={ch._id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-600 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-500"
                          checked={selectedChapters.includes(ch._id)}
                          onChange={() => handleChapterToggle(ch._id)}
                        />
                        <span className="font-semibold text-emerald-400 w-8 text-sm">Ch {ch.chapterNumber}</span>
                        <span className="text-slate-300 flex-1 truncate text-sm">{ch.title}</span>
                      </label>
                    ))}
                    {chapters.length === 0 && <p className="text-slate-500 py-2 text-center text-sm">No chapters found.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Config */}
            <div className="flex flex-col gap-4">
              <div className="glass-panel p-4 shadow-lg border border-slate-700/50">
                <h2 className="text-base font-bold flex items-center gap-1.5 mb-3 border-b border-slate-700/50 pb-2 text-slate-200">
                  <Layers className="text-blue-400" size={18} /> Questions & Marks
                </h2>

                <div className="flex flex-col gap-2 mb-2">
                  <div className="grid grid-cols-3 gap-2 mb-0.5">
                    <span className="font-semibold text-slate-400 text-[11px]">Type</span>
                    <span className="font-semibold text-slate-400 text-[11px] text-center">Count</span>
                    <span className="font-semibold text-slate-400 text-[11px] text-center">Marks (Each)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="font-semibold text-slate-300 text-sm">MCQs</span>
                    <div className="flex items-center justify-center bg-slate-900 border border-slate-600 rounded focus-within:border-blue-500 w-full overflow-hidden">
                      <input type="number" min="0" max={availableCounts.MCQ} value={counts.MCQ} onChange={(e) => handleCountChange('MCQ', e.target.value)} className="w-full bg-transparent p-1 text-sm text-right text-white outline-none" />
                      <span className="text-[10px] text-slate-400 whitespace-nowrap pr-2 pl-1">/ {availableCounts.MCQ}</span>
                    </div>
                    <input type="number" min="0" step="0.5" value={marks.MCQ} onChange={(e) => handleMarksChange('MCQ', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-1 text-sm text-center text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="font-semibold text-slate-300 text-sm">Short Qs</span>
                    <div className="flex items-center justify-center bg-slate-900 border border-slate-600 rounded focus-within:border-blue-500 w-full overflow-hidden">
                      <input type="number" min="0" max={availableCounts.Short} value={counts.Short} onChange={(e) => handleCountChange('Short', e.target.value)} className="w-full bg-transparent p-1 text-sm text-right text-white outline-none" />
                      <span className="text-[10px] text-slate-400 whitespace-nowrap pr-2 pl-1">/ {availableCounts.Short}</span>
                    </div>
                    <input type="number" min="0" step="0.5" value={marks.Short} onChange={(e) => handleMarksChange('Short', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-1 text-sm text-center text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="font-semibold text-slate-300 text-sm">Long Qs</span>
                    <div className="flex items-center justify-center bg-slate-900 border border-slate-600 rounded focus-within:border-blue-500 w-full overflow-hidden">
                      <input type="number" min="0" max={availableCounts.Long} value={counts.Long} onChange={(e) => handleCountChange('Long', e.target.value)} className="w-full bg-transparent p-1 text-sm text-right text-white outline-none" />
                      <span className="text-[10px] text-slate-400 whitespace-nowrap pr-2 pl-1">/ {availableCounts.Long}</span>
                    </div>
                    <input type="number" min="0" step="0.5" value={marks.Long} onChange={(e) => handleMarksChange('Long', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-1 text-sm text-center text-white focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="glass-panel p-4 shadow-lg border border-slate-700/50">
                <h2 className="text-base font-bold flex items-center gap-1.5 mb-3 border-b border-slate-700/50 pb-2 text-slate-200">
                  <PenTool className="text-purple-400" size={18} /> Paper Details
                </h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Test Title</label>
                    <input type="text" value={testMetadata.title} onChange={e => setTestMetadata({ ...testMetadata, title: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-sm text-white focus:border-purple-500 outline-none" placeholder="e.g. Midterm Examination" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-0.5"><Clock size={12} /> Time Allowed</label>
                      <input type="text" value={testMetadata.timeAllowed} onChange={e => setTestMetadata({ ...testMetadata, timeAllowed: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-sm text-white focus:border-purple-500 outline-none" placeholder="e.g. 2 Hours" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-0.5"><Calendar size={12} /> Date</label>
                      <input type="date" value={testMetadata.date} onChange={e => setTestMetadata({ ...testMetadata, date: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-sm text-white focus:border-purple-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-0.5">
                      Total Marks
                    </label>
                    <input type="text" value={testMetadata.totalMarks} onChange={e => setTestMetadata({ ...testMetadata, totalMarks: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-sm text-white focus:border-purple-500 outline-none" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || selectedChapters.length === 0}
                className={`w-full bg-green-400 hover:bg-blue-700 text-white font-bold py-3 px-6 text-base rounded-xl shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 mt-2 ${selectedChapters.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? 'Generating...' : <><CheckSquare size={20} /> Generate Test Paper</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Test Paper Section */}
      {generatedTest && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 print:hidden bg-slate-800 p-4 rounded-xl border border-slate-700">
            <button onClick={() => setGeneratedTest(null)} className="w-full sm:w-auto text-slate-300 hover:text-white px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-medium text-center">
              &larr; Configure New Test
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button onClick={handleDownloadWord} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">
                <Download size={18} /> Download Word
              </button>
              <button onClick={handlePrint} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">
                <Printer size={18} /> Print / Save as PDF
              </button>
            </div>
          </div>

          <style>
            {`
              @media print {
                @page { size: A4 portrait; margin: 20mm; }
                body { background: white; -webkit-print-color-adjust: exact; }
              }
            `}
          </style>

          <div className="bg-[#ffffff] text-[#000000] p-10 min-h-[1050px] shadow-2xl rounded-sm print:shadow-none print:p-0 mx-auto" style={{ maxWidth: '210mm' }} id="printable-test">
            <div className="text-center mb-6 border-b-2 border-black pb-4">
              <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{testMetadata.title || 'Custom Test Paper'}</h1>
              <p className="text-lg font-semibold text-gray-700">
                {subjects.find(s => s._id === selectedSubject)?.name} - Class {classes.find(c => c._id === selectedClass)?.gradeLevel}
              </p>
              <div className="flex justify-between items-end mt-6 text-sm font-bold text-gray-800">
                <div className="text-left">
                  <p>Date: {testMetadata.date || '___/___/______'}</p>
                  <p>Time Allowed: {testMetadata.timeAllowed || '_________'}</p>
                </div>
                <div className="text-right text-lg">
                  <p>Total Marks: {testMetadata.totalMarks || calculateAutoTotal()}</p>
                </div>
              </div>
            </div>

            {/* MCQs */}
            {generatedTest.MCQs.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4 bg-gray-200 p-2 rounded">
                  <h2 className="text-lg font-bold">Section A: Multiple Choice Questions</h2>
                  <span className="font-bold text-sm">[{generatedTest.MCQs.length} × {marks.MCQ} = {generatedTest.MCQs.length * marks.MCQ} Marks]</span>
                </div>
                <div className="flex flex-col gap-4">
                  {generatedTest.MCQs.map((q, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <p className="font-semibold text-base mb-2">{idx + 1}. <Latex>{cleanPrefix(q.questionText, false)}</Latex></p>
                      {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 mb-2 object-contain" />}
                      <div className="grid grid-cols-2 gap-y-1 gap-x-4 pl-6 text-sm">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-start gap-2">
                            <span className="font-medium">{String.fromCharCode(65 + optIdx)})</span>
                            <span><Latex>{cleanPrefix(opt, true)}</Latex></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shorts */}
            {generatedTest.Shorts.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4 bg-gray-200 p-2 rounded">
                  <h2 className="text-lg font-bold">Section B: Short Questions</h2>
                  <span className="font-bold text-sm">[{generatedTest.Shorts.length} × {marks.Short} = {generatedTest.Shorts.length * marks.Short} Marks]</span>
                </div>
                <div className="flex flex-col gap-6">
                  {generatedTest.Shorts.map((q, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <p className="font-semibold text-base mb-1">Q{idx + 1}. <Latex>{cleanPrefix(q.questionText, false)}</Latex></p>
                      {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 mb-2 object-contain" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Longs */}
            {generatedTest.Longs.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4 bg-gray-200 p-2 rounded">
                  <h2 className="text-lg font-bold">Section C: Long Questions</h2>
                  <span className="font-bold text-sm">[{generatedTest.Longs.length} × {marks.Long} = {generatedTest.Longs.length * marks.Long} Marks]</span>
                </div>
                <div className="flex flex-col gap-8">
                  {generatedTest.Longs.map((q, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <p className="font-semibold text-base mb-1">Q{idx + 1}. <Latex>{cleanPrefix(q.questionText, false)}</Latex></p>
                      {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 mb-2 object-contain" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(generatedTest.MCQs.length === 0 && generatedTest.Shorts.length === 0 && generatedTest.Longs.length === 0) && (
              <p className="text-center text-gray-500 italic py-10">No questions found matching your criteria. Try selecting more chapters or adjusting the count.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
