import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function Breadcrumbs() {
  const { boardId, classId, subjectId, chapterId } = useParams();
  const [crumbs, setCrumbs] = useState({});

  useEffect(() => {
    const params = new URLSearchParams();
    if (boardId) params.append('boardId', boardId);
    if (classId) params.append('classId', classId);
    if (subjectId) params.append('subjectId', subjectId);
    if (chapterId) params.append('chapterId', chapterId);
    
    if (params.toString()) {
      api.get(`/public/breadcrumbs?${params.toString()}`).then(res => {
        setCrumbs(res.data);
      });
    }
  }, [boardId, classId, subjectId, chapterId]);

  if (!boardId && !classId && !subjectId && !chapterId) return null;

  return (
    <div className="text-sm text-slate-400 font-medium flex flex-wrap items-center gap-2 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-6">
      <span className="text-slate-500">Path:</span>
      {crumbs.board && <span className="text-slate-200">{crumbs.board}</span>}
      {crumbs.class && (
        <>
          <span className="text-emerald-500/50">/</span>
          <span className="text-slate-200">{crumbs.class}</span>
        </>
      )}
      {crumbs.subject && (
        <>
          <span className="text-emerald-500/50">/</span>
          <span className="text-slate-200">{crumbs.subject}</span>
        </>
      )}
      {crumbs.chapter && (
        <>
          <span className="text-emerald-500/50">/</span>
          <span className="text-emerald-400">{crumbs.chapter}</span>
        </>
      )}
    </div>
  );
}
