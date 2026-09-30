import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowRight, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
export default function ChapterQuiz() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    api.get(`/public/chapters/${chapterId}/questions`)
      .then(res => {
        const mcqs = res.data.filter(q => q.type === 'MCQ');
        setQuestions(mcqs);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    const token = localStorage.getItem('token');
    if (token && chapterId) {
      api.post('/visits', { itemType: 'Chapter', itemId: chapterId }).catch(err => console.error('Failed to record visit:', err));
    }
  }, [chapterId]);

  const handleSelectOption = (option) => {
    setUserAnswers({
      ...userAnswers,
      [currentIndex]: option
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    // Calculate Score
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setShowResult(true);

    // Submit progress if logged in
    if (user) {
      try {
        await api.post('/progress/update', {
          chapterId,
          mcqScore: calculatedScore,
          totalQuestions: questions.length,
          status: 'Completed'
        });
      } catch(err) {
        console.error('Failed to save progress', err);
      }
    }
  };

  const handleReattempt = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setShowResult(false);
    setShowAnswers(false);
    setScore(0);
  };

  if (loading) return <div className="text-center py-20 text-lg animate-pulse">Loading Quiz...</div>;
  if (questions.length === 0) return <div className="text-center py-20 text-slate-400">No MCQs available for this chapter yet.</div>;

  if (showResult) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <Breadcrumbs />
        <div className="glass-panel p-8 text-center mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Quiz Completed!</h2>
          <div className="text-4xl font-bold text-emerald-400 mb-2">
            {score} / {questions.length}
          </div>
          <div className="text-lg font-medium text-emerald-300 mb-6">
            {Math.round((score / questions.length) * 100)}%
          </div>
          <p className="text-slate-400 mb-8">
            {user ? 'Your progress has been saved.' : 'Log in to the Student Portal to save your progress next time!'}
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <button onClick={handleReattempt} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300">
              Reattempt Quiz
            </button>
            <button onClick={() => navigate(-1)} className="btn-primary">
              Back to Chapters
            </button>
            <button onClick={() => setShowAnswers(!showAnswers)} className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300">
              {showAnswers ? 'Hide Answers' : 'View Answers'}
            </button>
          </div>
        </div>
        
        {/* Show review of answers */}
        {showAnswers && (
          <div className="flex flex-col gap-4 mt-6">
            <h3 className="text-lg font-bold px-2 text-slate-100 border-b border-slate-700/50 pb-2">
              Review Your Answers
            </h3>
            {questions.map((q, i) => (
              <div key={i} className="glass-panel p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-100 text-sm font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <div dir="auto" className="text-base font-medium text-slate-100 leading-[2.5] break-words min-w-0 pb-1">
                    <Latex>{q.questionText}</Latex>
                  </div>
                </div>
                {q.imageUrl && (
                  <div className="mb-4 ml-9">
                    <img src={q.imageUrl} alt="Question Diagram" className="max-h-40 rounded-lg object-contain border border-slate-700 bg-slate-900" />
                  </div>
                )}
                <div className="flex flex-col gap-2 ml-9">
                  {q.options.map((opt, optIdx) => {
                    let badge = null;
                    let style = "py-2 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm sm:text-base";
                    
                    if (opt === q.correctAnswer) {
                      style = "py-2 px-3 rounded-lg border border-emerald-500 bg-emerald-500/10 text-emerald-700 font-medium text-sm sm:text-base";
                      badge = <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
                    } else if (opt === userAnswers[i]) {
                      style = "py-2 px-3 rounded-lg border border-rose-400 bg-rose-500/10 text-rose-700 font-medium text-sm sm:text-base";
                      badge = <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
                    }
                    
                    return (
                      <div key={optIdx} className={`flex items-center justify-between gap-3 ${style}`}>
                        <div dir="auto" className="break-words leading-[2.5] min-w-0 pb-1"><Latex>{opt}</Latex></div>
                        {badge}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];
  const isLastQuestion = currentIndex + 1 === questions.length;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <Breadcrumbs />
      <div className="glass-panel p-8">
        <div className="flex justify-between items-center mb-6 text-sm text-slate-400 font-medium border-b border-slate-700 pb-4">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <div className="flex gap-2">
            {Object.keys(userAnswers).length} Answered
          </div>
        </div>
        
        <h2 dir="auto" className="text-lg font-bold text-white mb-6 leading-[2.5] break-words pb-2">
          <Latex>{currentQ.questionText}</Latex>
        </h2>
        
        {currentQ.imageUrl && (
          <div className="mb-8">
            <img src={currentQ.imageUrl} alt="Question Diagram" className="max-h-64 rounded-xl object-contain border border-slate-700 bg-slate-900/50" />
          </div>
        )}

        <div className="flex flex-col gap-2 mb-8">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAnswer === opt;
            const btnClass = `text-left py-3 px-4 rounded-lg border transition-all duration-200 cursor-pointer hover:border-blue-500/50 ${
              isSelected ? 'border-blue-500 bg-blue-500/10 text-slate-100 font-medium' : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-900/80'
            }`;

            return (
              <button 
                key={i}
                onClick={() => handleSelectOption(opt)}
                className={btnClass}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-500' : 'border-slate-500'}`}>
                     {isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </div>
                  <div dir="auto" className="text-sm sm:text-base break-words leading-[2.5] min-w-0 pb-1"><Latex>{opt}</Latex></div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-between items-center border-t border-slate-700 pt-6">
          <button 
            onClick={handlePrevious} 
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-colors ${currentIndex === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <ArrowLeft className="w-5 h-5" /> Previous
          </button>
          
          {!isLastQuestion ? (
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
              Finish Quiz <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
