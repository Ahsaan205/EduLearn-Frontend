import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, CheckCircle, Clock } from 'lucide-react';

export default function StudentDashboard({ user }) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress')
      .then(res => {
        setProgress(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10 animate-pulse">Loading dashboard...</div>;

  // Prepare data for chart
  const chartData = progress.map(p => ({
    name: p.chapterId?.title || 'Chapter',
    score: p.mcqScore
  }));

  const totalQuizzes = progress.length;
  const totalScore = progress.reduce((acc, p) => acc + p.mcqScore, 0);
  const avgScore = totalQuizzes > 0 ? (totalScore / totalQuizzes).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}!</h1>
        <p className="text-slate-400">Here is your learning progress overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Quizzes Taken</p>
            <p className="text-2xl font-bold">{totalQuizzes}</p>
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Score</p>
            <p className="text-2xl font-bold">{totalScore}</p>
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Average Score</p>
            <p className="text-2xl font-bold">{avgScore}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Scores by Chapter</h2>
        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
            You haven't taken any quizzes yet. Start a chapter to see your progress here!
          </div>
        )}
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="flex flex-col gap-3">
          {progress.length > 0 ? progress.slice().reverse().map(p => (
            <div key={p._id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="font-medium text-white">{p.chapterId?.title || 'Unknown Chapter'}</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold">
                Score: {p.mcqScore}
              </span>
            </div>
          )) : (
             <div className="text-slate-500 text-sm">No activity recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
}
