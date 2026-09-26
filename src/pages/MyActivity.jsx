import { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, CheckCircle, Clock, BookOpen, Target, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MyActivity() {
  const { user } = useAuth();
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

  if (loading) return <div className="text-center py-20 animate-pulse text-lg text-[#666666]">Loading activity...</div>;

  const totalQuizzes = progress.length;
  const totalScore = progress.reduce((acc, p) => acc + (p.mcqScore || 0), 0);
  const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">My Activity</h1>
        <p className="text-[#4a543e]">Track your learning progress and quiz results, {user?.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2 border border-[#d5ccbe]">
          <div className="w-12 h-12 rounded-full bg-[#8B9A6E]/10 text-[#62704a] flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold text-[#111111]">{totalQuizzes}</p>
          <p className="text-[#666666] text-sm uppercase tracking-wider font-bold">Quizzes Taken</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2 border border-[#d5ccbe]">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold text-[#111111]">{totalScore}</p>
          <p className="text-[#666666] text-sm uppercase tracking-wider font-bold">Total Correct</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2 border border-[#d5ccbe]">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold text-[#111111]">{avgScore}</p>
          <p className="text-[#666666] text-sm uppercase tracking-wider font-bold">Average Score</p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 border border-[#d5ccbe]">
        <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#8B9A6E]" /> Recent Quiz Results
        </h2>
        <div className="flex flex-col gap-4">
          {progress.length > 0 ? progress.slice().reverse().map(p => {
            const total = p.totalQuestions || 10;
            const percentage = Math.round((p.mcqScore / total) * 100);
            
            let badgeClass = "bg-slate-100 text-slate-700";
            if (percentage >= 80) badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
            else if (percentage < 50) badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
            else badgeClass = "bg-[#8B9A6E]/10 text-[#5c6650] border-[#8B9A6E]/30";

            return (
              <div key={p._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#FFFFFF] rounded-xl border border-[#d5ccbe] shadow-sm gap-4 transition-all hover:shadow-md hover:border-[#8B9A6E]/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f4f7f7] flex items-center justify-center shrink-0 border border-[#e8ece1] group-hover:bg-[#8B9A6E]/10 group-hover:text-[#8B9A6E] transition-colors">
                    <Target className="w-5 h-5 text-[#8B9A6E]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111111] text-lg">{p.chapterId?.title || 'Unknown Chapter'}</h3>
                    <p className="text-sm text-[#666666] font-medium">
                      Chapter {p.chapterId?.chapterNumber || '?'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex-1 sm:flex-none text-right">
                    <p className="text-xl font-extrabold text-[#111111]">{p.mcqScore} <span className="text-sm text-[#666666] font-medium">/ {total}</span></p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg font-bold min-w-[70px] text-center border ${badgeClass}`}>
                    {percentage}%
                  </div>
                </div>
              </div>
            );
          }) : (
             <div className="text-center py-12 bg-[#f4f7f7] rounded-xl border-2 border-dashed border-[#d5ccbe]">
                <p className="text-[#666666] font-bold text-lg mb-1">No quiz activity recorded yet</p>
                <p className="text-sm text-[#a3a89e]">Take a chapter quiz to see your results here.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
