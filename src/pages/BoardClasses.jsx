import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { GraduationCap } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function BoardClasses() {
  const { boardId } = useParams();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/boards/${boardId}/classes`).then(res => {
      setClasses(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [boardId]);

  if (loading) return <div className="text-center py-20 text-xl animate-pulse">Loading Classes...</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <Breadcrumbs />
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-shadow-neutral-600 bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Select Your Class
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {classes.map((cls, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={cls._id}
          >
            <Link to={`/board/${boardId}/class/${cls._id}`} className="block h-full">
              <div className="glass-panel p-4 card-hover h-full flex flex-row items-center text-left gap-4 hover:bg-slate-800/50">
                <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-200 leading-tight">{cls.gradeLevel}th</h2>
                  <span className="text-xs text-slate-400 font-medium">Class</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
