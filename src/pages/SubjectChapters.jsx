import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { PlayCircle, Settings, Download, ChevronDown } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';

export default function SubjectChapters() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get(`/public/subjects/${subjectId}/chapters`).then(res => {
      setChapters(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

    const token = localStorage.getItem('token');
    if (token && subjectId) {
      api.post('/visits', { itemType: 'Subject', itemId: subjectId }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error('Failed to record visit:', err));
    }
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
        ) : chapters.map((ch, i) => {
          const isExpanded = expandedId === ch._id;

          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={ch._id}
              className={`glass-panel overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-blue-500/30' : ''}`}
            >
              <div 
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : ch._id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center text-lg font-bold text-slate-800 shrink-0 shadow-md">
                    {ch.chapterNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className={`text-base sm:text-lg font-semibold break-words whitespace-normal leading-tight transition-colors ${isExpanded ? 'text-blue-400' : 'text-slate-100'}`}>
                      {ch.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`/chapter/${ch._id}/print?title=${encodeURIComponent(ch.title)}`, '_blank'); }} 
                    className="bg-slate-700/50 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold py-2 px-4 transition-all duration-300" 
                    title="Download Chapter PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center w-9 h-9 transition-all duration-300"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-700/50 bg-slate-900/30">
                      <p className="text-sm text-slate-400 mb-3 font-medium">Select a practice mode:</p>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStart(ch._id, 'MCQ'); }} 
                          className="flex-1 sm:flex-none bg-[#5C7285] hover:bg-[#4A5D6D] text-white rounded-lg shadow-sm flex items-center justify-center py-2 px-6 text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          MCQs
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStart(ch._id, 'Short'); }} 
                          className="flex-1 sm:flex-none bg-[#8B9A6E] hover:bg-[#76855b] text-white rounded-lg shadow-sm flex items-center justify-center py-2 px-6 text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          Short Qs
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStart(ch._id, 'Long'); }} 
                          className="flex-1 sm:flex-none bg-[#A37C82] hover:bg-[#8F6A70] text-white rounded-lg shadow-sm flex items-center justify-center py-2 px-6 text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          Long Qs
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
