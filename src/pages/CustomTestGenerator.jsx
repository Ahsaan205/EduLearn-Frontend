import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Settings, Printer, Download, BookOpen, CheckSquare, Layers, Calendar, Clock, PenTool } from 'lucide-react';
import { toast } from 'react-toastify';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

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
    <div className="max-w-5xl mx-auto flex flex-col gap-6 print:m-0 print:p-0 print:max-w-none print:w-full">

      {/* Configuration Section */}
      {!generatedTest && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-black bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center gap-2">
              <Settings className="w-8 h-8 text-emerald-400" /> Global Test Generator
            </h1>
            <p className="text-slate-400 mt-2">Select your curriculum and build custom exam papers instantly.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Selection */}
            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 shadow-xl border border-slate-700/50">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200 mb-4 border-b border-slate-700/50 pb-3">
                  <BookOpen className="text-emerald-400" size={20} /> Select Curriculum
                </h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Board</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none transition-all" value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)}>
                      <option value="">Select Board</option>
                      {boards.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Class</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none transition-all" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedBoard}>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c._id} value={c._id}>{c.gradeLevel}th</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Subject</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none transition-all" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedClass}>
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {selectedSubject && (
                <div className="glass-panel p-6 shadow-xl border border-slate-700/50">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200">
                      <BookOpen className="text-emerald-400" size={20} /> Select Chapters
                    </h2>
                    <button onClick={handleSelectAll} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
                      {selectedChapters.length === chapters.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {chapters.map(ch => (
                      <label key={ch._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-600 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-emerald-500"
                          checked={selectedChapters.includes(ch._id)}
                          onChange={() => handleChapterToggle(ch._id)}
                        />
                        <span className="font-semibold text-emerald-400 w-8">Ch {ch.chapterNumber}</span>
                        <span className="text-slate-300 flex-1 truncate">{ch.title}</span>
                      </label>
                    ))}
                    {chapters.length === 0 && <p className="text-slate-500 py-4 text-center">No chapters found for this subject.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Config */}
            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 shadow-xl border border-slate-700/50">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-3 text-slate-200">
                  <Layers className="text-blue-400" size={20} /> Questions & Marks
                </h2>

                <div className="flex flex-col gap-4 mb-4">
                  <div className="grid grid-cols-3 gap-2 mb-1">
                    <span className="font-semibold text-slate-400 text-sm">Type</span>
                    <span className="font-semibold text-slate-400 text-sm text-center">Count</span>
                    <span className="font-semibold text-slate-400 text-sm text-center">Marks (Each)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="font-semibold text-slate-300 text-sm">MCQs</span>
                    <input type="number" min="0" value={counts.MCQ} onChange={(e) => handleCountChange('MCQ', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-center text-white focus:border-blue-500 outline-none" />
                    <input type="number" min="0" step="0.5" value={marks.MCQ} onChange={(e) => handleMarksChange('MCQ', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-center text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="font-semibold text-slate-300 text-sm">Short Qs</span>
                    <input type="number" min="0" value={counts.Short} onChange={(e) => handleCountChange('Short', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-center text-white focus:border-blue-500 outline-none" />
                    <input type="number" min="0" step="0.5" value={marks.Short} onChange={(e) => handleMarksChange('Short', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-center text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="font-semibold text-slate-300 text-sm">Long Qs</span>
                    <input type="number" min="0" value={counts.Long} onChange={(e) => handleCountChange('Long', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-center text-white focus:border-blue-500 outline-none" />
                    <input type="number" min="0" step="0.5" value={marks.Long} onChange={(e) => handleMarksChange('Long', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-center text-white focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 shadow-xl border border-slate-700/50">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-3 text-slate-200">
                  <PenTool className="text-purple-400" size={20} /> Paper Details
                </h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Test Title</label>
                    <input type="text" value={testMetadata.title} onChange={e => setTestMetadata({ ...testMetadata, title: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none" placeholder="e.g. Midterm Examination" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1 text-sm text-slate-400 mb-1"><Clock size={14} /> Time Allowed</label>
                      <input type="text" value={testMetadata.timeAllowed} onChange={e => setTestMetadata({ ...testMetadata, timeAllowed: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none" placeholder="e.g. 2 Hours" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-sm text-slate-400 mb-1"><Calendar size={14} /> Date</label>
                      <input type="date" value={testMetadata.date} onChange={e => setTestMetadata({ ...testMetadata, date: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="flex justify-between items-center text-sm text-slate-400 mb-1">
                      <span>Total Marks</span>
                      <button type="button" onClick={() => setTestMetadata({ ...testMetadata, totalMarks: calculateAutoTotal() })} className="text-xs text-purple-400 hover:text-purple-300">Calculate Auto</button>
                    </label>
                    <input type="text" value={testMetadata.totalMarks} onChange={e => setTestMetadata({ ...testMetadata, totalMarks: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none" placeholder={`Auto: ${calculateAutoTotal()}`} />
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || selectedChapters.length === 0}
                className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 ${selectedChapters.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? 'Generating Paper...' : <><CheckSquare size={20} /> Generate Test Paper</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Test Paper Section */}
      {generatedTest && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center mb-4 print:hidden bg-slate-800 p-4 rounded-xl border border-slate-700">
            <button onClick={() => setGeneratedTest(null)} className="text-slate-300 hover:text-white px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-medium">
              &larr; Configure New Test
            </button>
            <div className="flex gap-3">
              <button onClick={handleDownloadWord} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">
                <Download size={18} /> Download Word
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">
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
                      <p className="font-semibold text-base mb-2">{idx + 1}. <Latex>{q.questionText}</Latex></p>
                      {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 mb-2 object-contain" />}
                      <div className="grid grid-cols-2 gap-y-1 gap-x-4 pl-6 text-sm">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-start gap-2">
                            <span className="font-medium">{String.fromCharCode(65 + optIdx)})</span>
                            <span><Latex>{opt}</Latex></span>
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
                      <p className="font-semibold text-base mb-1">Q{idx + 1}. <Latex>{q.questionText}</Latex></p>
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
                      <p className="font-semibold text-base mb-1">Q{idx + 1}. <Latex>{q.questionText}</Latex></p>
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
