import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, UserCircle, ArrowLeft, LogOut, ChevronDown, User, Activity, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/portal');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="glass-panel rounded-none border-t-0 border-x-0 sticky top-0 z-50 print:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-slate-300 hover:text-white flex items-center justify-center"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-black hover:text-gray-700 transition-colors">
            <BookOpen className="w-6 h-6" />
            <span className="hidden sm:inline">EduLearn</span>
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          {user?.role !== 'admin' && (
            <Link to="/custom-test-generator" className="flex items-center gap-2 hover:text-emerald-400 transition-colors font-medium mr-2">
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">Test Generator</span>
            </Link>
          )}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${showProfileMenu ? 'border-blue-500' : 'border-slate-700'}`}>
                  <img 
                    className="w-full h-full object-cover" 
                    src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=38bdf8`} 
                    alt="Profile" 
                  />
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180 text-blue-400' : ''}`} />
              </div>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 min-w-[240px] bg-slate-900 rounded-2xl shadow-xl border border-slate-700 flex flex-col overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-800 mb-1 bg-slate-800/50">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  </div>

                  {user?.role !== 'admin' && (
                    <>
                      <div onClick={() => { navigate('/my-profile'); setShowProfileMenu(false); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 hover:text-blue-400 cursor-pointer transition-colors text-sm font-medium text-slate-300">
                        <User size={16} /> My Profile
                      </div>
                      <div onClick={() => { navigate('/my-activity'); setShowProfileMenu(false); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 hover:text-blue-400 cursor-pointer transition-colors border-b border-slate-800 text-sm font-medium text-slate-300">
                        <Activity size={16} /> My activity
                      </div>
                    </>
                  )}
                  <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-colors mt-1 text-sm font-bold">
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/portal" className="flex items-center gap-2 hover:text-blue-400 transition-colors font-medium">
              <UserCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
