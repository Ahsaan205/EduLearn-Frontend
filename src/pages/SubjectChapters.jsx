import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { PlayCircle, Settings, Download } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';

export default function SubjectChapters() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/subjects/${subjectId}/chapters`).then(res => {
      setChapters(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [subjectId]);

  const handleStart = (chId, type) => {
    let path = `/chapter/${chId}/quiz`;
    if (type === 'Short') path = `/chapter/${chId}/short-questions`;
    if (type === 'Long') path = `/chapter/${chId}/long-questions`;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/portal?redirect=${path}`);
    } else {
      navigate(path);
    }
  };

  if (loading) return <div className="text-center py-20 text-lg animate-pulse">Loading Chapters...</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <Breadcrumbs />
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-4xl font-bold mb-2 text-white">
            Chapters
          </h1>
          <p className="text-slate-400">Select a chapter to start learning and practicing</p>
        </div>

      </div>

      <div className="flex flex-col gap-4">
        {chapters.length === 0 ? (
           <div className="text-center p-10 glass-panel">No chapters available yet.</div>
        ) : chapters.map((ch, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={ch._id}
          >
            <div className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center text-lg font-bold text-slate-300 shrink-0">
                  {ch.chapterNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold break-words whitespace-normal leading-tight">{ch.title}</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-5 sm:mt-0">
                <button onClick={() => handleStart(ch._id, 'MCQ')} className="flex-1 sm:flex-none bg-[#5C7285] hover:bg-[#4A5D6D] text-[#FFFFFF] rounded-xl shadow-md shadow-[#5C7285]/30 flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-5 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                  MCQs
                </button>
                <button onClick={() => handleStart(ch._id, 'Short')} className="flex-1 sm:flex-none bg-[#8B9A6E] hover:bg-[#76855b] text-[#FFFFFF] rounded-xl shadow-md shadow-[#8B9A6E]/30 flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-5 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                  Short Qs
                </button>
                <button onClick={() => handleStart(ch._id, 'Long')} className="flex-1 sm:flex-none bg-[#A37C82] hover:bg-[#8F6A70] text-[#FFFFFF] rounded-xl shadow-md shadow-[#A37C82]/30 flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-5 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                  Long Qs
                </button>
                <button onClick={() => window.open(`/chapter/${ch._id}/print?title=${encodeURIComponent(ch.title)}`, '_blank')} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-5 transition-all duration-300 transform hover:-translate-y-1 active:scale-95" title="Download Chapter PDF">
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
