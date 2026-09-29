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
    // Hide the main Navbar and set body background
    const style = document.createElement('style');
    style.innerHTML = `
      header, nav, .navbar { display: none !important; }
      body { background-color: #f1f5f9 !important; }
    `;
    document.head.appendChild(style);

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
        
        setTimeout(() => {
          const element = document.getElementById('pdf-content');
          if (!element) {
            setStatus("Failed to find content. Please try again.");
            return;
          }
          
          const opt = {
            margin:       10,
            filename:     `${titleRef.current.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(element).save().then(() => {
             setStatus("Download Complete! You can safely close this tab.");
             setTimeout(() => {
                window.close(); // Try to close automatically
             }, 3000);
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

      return () => {
        document.head.removeChild(style);
      };
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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f1f5f9]">
        <div className="bg-[#FFFFFF] p-8 rounded-xl shadow-lg border border-[#e2e8f0] text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-[#1e293b]">{status}</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto"></div>
        </div>
      </div>
    );
  }

  const mcqs = questions.filter(q => q.type === 'MCQ');
  const shorts = questions.filter(q => q.type === 'Short');
  const longs = questions.filter(q => q.type === 'Long');

  return (
    <div className="min-h-screen">
      
      {/* Full-screen Loading Overlay to hide the PDF content from the user while it generates */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f1f5f9]">
        <div className="bg-[#FFFFFF] p-8 rounded-xl shadow-lg border border-[#e2e8f0] text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-[#1e293b]">{status}</h2>
          <p className="text-[#475569] mb-6">Please do not close this tab until the download is complete.</p>
          <button 
            onClick={() => { window.close(); navigate(-1); }} 
            className="bg-[#1e293b] text-[#FFFFFF] px-6 py-2 rounded-lg font-bold hover:bg-[#334155] transition-colors"
          >
            Close Tab
          </button>
        </div>
      </div>

      {/* The actual content to be exported to PDF, rendered in normal flow so html2canvas can capture it perfectly */}
      <div className="absolute top-0 left-0 w-full flex justify-center z-0 p-8">
        <div id="pdf-content" className="bg-[#FFFFFF] text-[#000000] p-8 w-[210mm] max-w-full" style={{ fontFamily: 'Times New Roman, serif' }}>
          <div className="text-center mb-8 border-b-2 border-[#000000] pb-4">
            <h1 className="text-3xl font-bold mb-2">EduLearn Notes</h1>
            <h2 className="text-xl">{chapterTitle}</h2>
          </div>

          {/* MCQs */}
          {mcqs.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 border-b border-[#9ca3af] pb-1 uppercase tracking-wider">Multiple Choice Questions</h3>
              <div className="flex flex-col gap-6">
                {mcqs.map((q, i) => (
                  <div key={q._id} style={{ pageBreakInside: 'avoid' }}>
                    <div className="font-bold mb-2 flex gap-2">
                      <span>{i + 1}.</span> 
                      <div>{formatText(q.questionText)}</div>
                    </div>
                    {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 object-contain mb-2 ml-6" crossOrigin="anonymous" />}
                    <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {q.options.map((opt, optIdx) => (
                         <div key={optIdx} className="flex gap-2">
                           <span>{String.fromCharCode(97 + optIdx)})</span>
                           <span><Latex>{opt}</Latex></span>
                         </div>
                      ))}
                    </div>
                    <div className="ml-6 mt-1 text-sm bg-[#f3f4f6] px-3 py-1 inline-block rounded font-medium border border-[#d1d5db] text-[#111827]">
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
              <h3 className="text-xl font-bold mb-4 border-b border-[#9ca3af] pb-1 uppercase tracking-wider" style={{ pageBreakBefore: 'always' }}>Short Answer Questions</h3>
              <div className="flex flex-col gap-6">
                {shorts.map((q, i) => (
                  <div key={q._id} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
                    <div className="font-bold mb-2 flex gap-2">
                      <span>Q{i + 1}.</span> 
                      <div>{formatText(q.questionText)}</div>
                    </div>
                    {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 object-contain mb-2 ml-8" crossOrigin="anonymous" />}
                    <div className="ml-8 text-[#1f2937] leading-relaxed whitespace-pre-wrap">
                      {q.answerImageUrl && <img src={q.answerImageUrl} alt="Answer Diagram" className="max-h-40 object-contain mb-2" crossOrigin="anonymous" />}
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
              <h3 className="text-xl font-bold mb-4 border-b border-[#9ca3af] pb-1 uppercase tracking-wider" style={{ pageBreakBefore: 'always' }}>Long Answer Questions</h3>
              <div className="flex flex-col gap-8">
                {longs.map((q, i) => (
                  <div key={q._id} className="mb-6" style={{ pageBreakInside: 'avoid' }}>
                    <div className="font-bold mb-3 flex gap-2">
                      <span>Q{i + 1}.</span> 
                      <div>{formatText(q.questionText)}</div>
                    </div>
                    {q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-48 object-contain mb-3 ml-8" crossOrigin="anonymous" />}
                    <div className="ml-8 text-[#1f2937] leading-relaxed whitespace-pre-wrap">
                      {q.answerImageUrl && <img src={q.answerImageUrl} alt="Answer Diagram" className="max-h-48 object-contain mb-3" crossOrigin="anonymous" />}
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
