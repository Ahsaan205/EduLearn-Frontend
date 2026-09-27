import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, UserCircle, Calendar, Activity, Phone, MapPin, Users, ChevronDown, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import StudentDashboard from './StudentDashboard';
import { useAuth } from '../context/AuthContext';

export default function Portal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Not Selected');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password, age, gender, phone, address };
      const res = await api.post(endpoint, payload);

      login(res.data.user, res.data.token);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        const searchParams = new URLSearchParams(location.search);
        const redirectPath = searchParams.get('redirect');
        if (redirectPath) {
          navigate(redirectPath);
        }
      }
      toast.success(isLogin ? "Login successful!" : "Account created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    }
  };

  if (user && user.role === 'student') {
    return <Navigate to="/" replace />;
  } else if (user && user.role === 'admin') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-4xl font-bold mb-4 text-emerald-400">Welcome, Admin!</h1>
        <p className="text-xl text-slate-400 mb-6">Redirecting to dashboard...</p>
        <button onClick={() => navigate('/admin')} className="btn-primary">Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-6">
      <div className="w-full max-w-[460px] glass-panel p-5 sm:p-7">
        <div className="mb-6 text-center flex flex-col items-center">
          <div className="bg-blue-500/20 p-3 rounded-full mb-3 text-blue-400">
            <Activity size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? "Login to access your account" : "Join our platform"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isLogin ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 group">
                  <UserCircle className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full focus:outline-none bg-transparent text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="age">
                    Age
                  </label>
                  <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 group">
                    <Calendar className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                    <input
                      type="number"
                      id="age"
                      placeholder="18"
                      required
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full focus:outline-none bg-transparent text-white text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="gender">
                    Gender
                  </label>
                  <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 relative group">
                    <Users className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full focus:outline-none bg-transparent text-white text-sm cursor-pointer appearance-none pr-8 font-medium [&>option]:bg-slate-800 [&>option]:text-white"
                    >
                      <option value="Not Selected" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 text-slate-500 pointer-events-none group-focus-within:rotate-180 group-focus-within:text-blue-400 transition-all duration-200" size={16} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="phone">
                    Phone
                  </label>
                  <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 group">
                    <Phone className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                    <input
                      type="tel"
                      id="phone"
                      placeholder="0300 1234567"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full focus:outline-none bg-transparent text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="address">
                    Address
                  </label>
                  <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 group">
                    <MapPin className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                    <input
                      type="text"
                      id="address"
                      placeholder="City, Country"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full focus:outline-none bg-transparent text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="email">
                    Email
                  </label>
                  <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 group">
                    <Mail className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                    <input
                      type="email"
                      id="email"
                      placeholder="user@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full focus:outline-none bg-transparent text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 group relative">
                    <Lock className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full focus:outline-none bg-transparent text-white text-sm pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-500 hover:text-blue-400 focus:outline-none transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 group">
                  <Mail className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                  <input
                    type="email"
                    id="email"
                    placeholder="user@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full focus:outline-none bg-transparent text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="flex items-center border border-slate-700/80 rounded-xl px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all duration-200 group relative">
                  <Lock className="text-slate-500 mr-2 shrink-0 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full focus:outline-none bg-transparent text-white text-sm pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-500 hover:text-blue-400 focus:outline-none transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 btn-primary font-bold rounded-lg shadow-sm text-sm transition-all"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setName("");
                setAge("");
                setGender("Not Selected");
                setPhone("");
                setAddress("");
                setEmail("");
                setPassword("");
                setShowPassword(false);
              }}
              className="text-xs text-slate-400 hover:text-blue-400 font-bold transition-colors mt-2 text-center"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
