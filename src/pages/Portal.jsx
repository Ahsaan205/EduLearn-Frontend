import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, UserCircle, Calendar, Activity, Phone, MapPin, Users, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
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

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      // Here you would send the access token to your backend to verify and authenticate
      const res = await api.post('/auth/google', { token: tokenResponse.access_token });
      
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        const searchParams = new URLSearchParams(location.search);
        const redirectPath = searchParams.get('redirect');
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      }
      toast.success("Google Login successful!");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Auth failed');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google Sign In Failed'),
  });

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
        } else {
          navigate('/');
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

            <div className="relative flex items-center my-3">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg shadow-sm text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isLogin ? "Sign in with Google" : "Sign up with Google"}
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
