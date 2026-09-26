import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/boards').then(res => {
      setBoards(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (loading) return <div className="text-center py-20 text-xl animate-pulse">Loading Boards...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Welcome to EduPlatform
        </h1>
        <p className="text-slate-400 text-lg">Select your educational board to get started</p>
      </div>

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
                  <span className="text-xs font-medium px-2 py-1 bg-slate-700/50 rounded-full text-slate-300">
                    {board.type} Board
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
