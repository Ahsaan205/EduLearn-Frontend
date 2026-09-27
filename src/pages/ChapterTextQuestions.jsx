import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import Breadcrumbs from '../components/Breadcrumbs';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

export default function ChapterTextQuestions({ type }) {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const formatText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Remove the "- " before bold text
    const cleanedText = text.replace(/-\s*\*\*/g, '**');
    
    // Split by **bold** syntax
    const parts = cleanedText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      return <Latex key={i}>{part}</Latex>;
    });
  };

  useEffect(() => {
    api.get(`/public/chapters/${chapterId}/questions`)
      .then(res => {
        const filtered = res.data.filter(q => q.type === type);
        setQuestions(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [chapterId, type]);

  if (loading) return <div className="text-center py-20 text-base font-medium animate-pulse">Loading {type} Questions...</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <Breadcrumbs />
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-base font-medium font-bold text-white mb-2">
            {type} Questions
          </h1>
          <p className="text-slate-400">Review and practice the {type.toLowerCase()} questions for this chapter.</p>
        </div>
        <button onClick={() => navigate(-1)} className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors">
          Back
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-20 text-slate-400 glass-panel">
          No {type.toLowerCase()} questions available for this chapter yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q, i) => {
            const isExpanded = expandedId === q._id;
            return (
              <div 
                key={q._id} 
                className={`glass-panel overflow-hidden cursor-pointer transition-all duration-300 ${isExpanded ? 'ring-1 ring-blue-500/30' : 'hover:bg-slate-800/50'}`}
                onClick={() => setExpandedId(isExpanded ? null : q._id)}
              >
                <div className="p-5 md:p-6 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {q.imageUrl && (
                      <div className="mb-4">
                        <img src={q.imageUrl} alt="Question Diagram" className="max-h-48 rounded-lg object-contain border border-slate-700 bg-slate-900/50" />
                      </div>
                    )}
                    <h3 className={`text-base font-medium leading-relaxed transition-colors ${isExpanded ? 'text-sky-700 font-bold' : 'text-slate-100'}`}>
                      <span className="text-sky-600 font-bold mr-2">Q{i + 1}.</span> 
                      {formatText(q.questionText)}
                    </h3>
                  </div>
                  <div className={`text-slate-400 mt-1 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-sky-600' : ''}`}>
                    <ChevronDown size={24} />
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
                      <div className="px-5 md:px-6 pb-6 pt-1">
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500"></div>
                          <div className="pl-3 text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                            {q.answerImageUrl && (
                              <div className="mb-4">
                                <img src={q.answerImageUrl} alt="Answer Diagram" className="max-h-48 rounded-lg object-contain border border-slate-700 bg-slate-900/50" />
                              </div>
                            )}
                            {q.correctAnswer ? formatText(q.correctAnswer) : <span className="italic text-slate-500">No answer provided.</span>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
