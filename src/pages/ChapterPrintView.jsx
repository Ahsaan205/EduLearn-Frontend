import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import html2pdf from 'html2pdf.js';

export default function ChapterPrintView() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [chapterTitle, setChapterTitle] = useState("Chapter Notes");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Preparing Document...");
  const titleRef = useRef("Chapter Notes");

  useEffect(() => {
    // Fetch breadcrumbs to get the chapter name
    api.get(`/public/breadcrumbs?chapterId=${chapterId}`).then(res => {
       if (res.data.chapter) {
           setChapterTitle(res.data.chapter);
           titleRef.current = res.data.chapter;
       }
    }).catch(console.error);

    api.get(`/public/chapters/${chapterId}/questions`)
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
        setStatus("Generating PDF... Please wait.");
        
        // Automatically generate PDF after brief delay for rendering math
        setTimeout(() => {
          const element = document.getElementById('pdf-content');
          const opt = {
            margin:       10,
            filename:     `${titleRef.current}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(element).save().then(() => {
             setStatus("Download Complete! You can safely close this tab.");
          }).catch(err => {
             console.error("PDF generation failed", err);
             setStatus("Failed to generate PDF. Please try again.");
          });
        }, 1500);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        setStatus("Error loading questions.");
      });
  }, [chapterId]);

  const formatText = (text) => {
    if (typeof text !== 'string') return text;
    const cleanedText = text.replace(/-\s*\*\*/g, '**');
    const parts = cleanedText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</strong>;
      }
      return <Latex key={i}>{part}</Latex>;
    });
  };

  if (loading) return <div className="text-center py-10 text-xl font-medium">{status}</div>;

  const mcqs = questions.filter(q => q.type === 'MCQ');
  const shorts = questions.filter(q => q.type === 'Short');
  const longs = questions.filter(q => q.type === 'Long');

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8 flex flex-col items-center">
      
      <div className="mb-6 w-full max-w-4xl bg-white text-blue-900 p-6 rounded-xl shadow-lg border border-blue-200 text-center">
        <h2 className="text-2xl font-bold mb-2">{status}</h2>
        <p className="text-slate-600 mb-4">Please do not close this tab until the download is complete.</p>
        <button onClick={() => window.close()} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors">Close Tab</button>
      </div>

      {/* Hidden container that gets converted to PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div id="pdf-content" className="print-container bg-white text-black p-8 w-[210mm]" style={{ fontFamily: 'Times New Roman, serif' }}>
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold mb-2">EduLearn Notes</h1>
            <h2 className="text-xl">{chapterTitle}</h2>
          </div>

      {/* MCQs */}
      {mcqs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-400 pb-1 uppercase tracking-wider">Multiple Choice Questions</h3>
          <div className="flex flex-col gap-6">
            {mcqs.map((q, i) => (
              <div key={q._id} className="avoid-break">
                <div className="font-bold mb-2 flex gap-2">
                  <span>{i + 1}.</span> 
                  <div>{formatText(q.questionText)}</div>
                </div>
                {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 object-contain mb-2 ml-6" />}
                <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt, optIdx) => (
                     <div key={optIdx} className="flex gap-2">
                       <span>{String.fromCharCode(97 + optIdx)})</span>
                       <span><Latex>{opt}</Latex></span>
                     </div>
                  ))}
                </div>
                <div className="ml-6 mt-1 text-sm bg-gray-100 px-3 py-1 inline-block rounded font-medium border border-gray-300">
                  <strong>Answer:</strong> <Latex>{q.correctAnswer}</Latex>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Short Questions */}
      {shorts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-400 pb-1 uppercase tracking-wider page-break">Short Answer Questions</h3>
          <div className="flex flex-col gap-6">
            {shorts.map((q, i) => (
              <div key={q._id} className="avoid-break mb-4">
                <div className="font-bold mb-2 flex gap-2">
                  <span>Q{i + 1}.</span> 
                  <div>{formatText(q.questionText)}</div>
                </div>
                {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 object-contain mb-2 ml-8" />}
                <div className="ml-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {q.answerImageUrl && <img src={q.answerImageUrl} alt="Answer Diagram" className="max-h-40 object-contain mb-2" />}
                  {q.correctAnswer ? formatText(q.correctAnswer) : <em>No answer provided</em>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Long Questions */}
      {longs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-400 pb-1 uppercase tracking-wider page-break">Long Answer Questions</h3>
          <div className="flex flex-col gap-8">
            {longs.map((q, i) => (
              <div key={q._id} className="avoid-break mb-6">
                <div className="font-bold mb-3 flex gap-2">
                  <span>Q{i + 1}.</span> 
                  <div>{formatText(q.questionText)}</div>
                </div>
                {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-48 object-contain mb-3 ml-8" />}
                <div className="ml-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {q.answerImageUrl && <img src={q.answerImageUrl} alt="Answer Diagram" className="max-h-48 object-contain mb-3" />}
                  {q.correctAnswer ? formatText(q.correctAnswer) : <em>No answer provided</em>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        </div>
      </div>
    </div>
  );
}
