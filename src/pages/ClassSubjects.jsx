import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { Library } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ClassSubjects() {
  const { boardId, classId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/classes/${classId}/subjects`).then(res => {
      setSubjects(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [classId]);

  if (loading) return <div className="text-center py-20 text-xl animate-pulse">Loading Subjects...</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      <Breadcrumbs />
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Choose a Subject
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {subjects.map((sub, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={sub._id}
          >
            <Link to={`/board/${boardId}/class/${classId}/subject/${sub._id}`} className="block h-full">
              <div className="glass-panel p-6 card-hover h-full flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Library className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold">{sub.name}</h2>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
