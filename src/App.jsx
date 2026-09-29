import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BoardClasses from './pages/BoardClasses';
import ClassSubjects from './pages/ClassSubjects';
import SubjectChapters from './pages/SubjectChapters';
import ChapterQuiz from './pages/ChapterQuiz';
import Portal from './pages/Portal';
import MyProfile from './pages/MyProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChapterTextQuestions from './pages/ChapterTextQuestions';
import CustomTestGenerator from './pages/CustomTestGenerator';
import MyActivity from './pages/MyActivity';
import ChapterPrintView from './pages/ChapterPrintView';

function App() {
  return (
    <Router>
      <ToastContainer theme="dark" position="top-right" />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board/:boardId" element={<BoardClasses />} />
            <Route path="/board/:boardId/class/:classId" element={<ClassSubjects />} />
            <Route path="/board/:boardId/class/:classId/subject/:subjectId" element={<SubjectChapters />} />
            <Route path="/custom-test-generator" element={<CustomTestGenerator />} />
            <Route path="/chapter/:chapterId/quiz" element={<ChapterQuiz />} />
            <Route path="/chapter/:chapterId/short-questions" element={<ChapterTextQuestions type="Short" />} />
            <Route path="/chapter/:chapterId/long-questions" element={<ChapterTextQuestions type="Long" />} />
            <Route path="/chapter/:chapterId/print" element={<ChapterPrintView />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/my-activity" element={<MyActivity />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
