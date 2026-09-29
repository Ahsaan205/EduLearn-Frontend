import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [frequentVisits, setFrequentVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/boards').then(res => {
      setBoards(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

    const token = localStorage.getItem('token');
    if (token) {
      api.get('/visits', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setFrequentVisits(res.data))
        .catch(err => console.error(err));
    }
  }, []);

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (loading) return <div className="text-center py-20 text-xl animate-pulse">Loading...</div>;

  const handleVisitClick = (v) => {
    if (v.itemType === 'Chapter') {
      navigate(`/chapter/${v.itemId._id}/quiz`);
    } else if (v.itemType === 'Subject') {
      // Subject route requires board and class, using 'b' and 'c' as placeholders
      // because SubjectChapters.jsx only strictly relies on subjectId
      navigate(`/board/b/class/c/subject/${v.itemId._id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Welcome to EduLearn
        </h1>
        <p className="text-slate-400 text-lg">Select your educational board to get started</p>
      </div>

      {user && frequentVisits.length > 0 && (
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
               <BookOpen className="w-5 h-5" />
            </span>
            Frequently Visited
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {frequentVisits.map((v, i) => (
              <div 
                key={i} 
                onClick={() => handleVisitClick(v)}
                className="flex flex-col justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <div className="flex flex-col mb-4">
                  <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">{v.itemType}</span>
                  <span className="font-bold text-white text-base line-clamp-2">{v.itemId?.title || v.itemId?.name || 'Unknown'}</span>
                </div>
                <div className="self-start bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                   {v.count} visits
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-white px-2">Educational Boards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={board._id}
            >
              <Link to={`/board/${board._id}`} className="block h-full">
                <div className="glass-panel p-6 card-hover h-full flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{board.name}</h2>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
