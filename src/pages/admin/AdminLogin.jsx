import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import api from '../../api';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/admin/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'admin');
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="glass-panel p-8 border-rose-500/30 shadow-rose-500/10">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-rose-500/20 text-rose-400 mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Admin Portal</h2>
          <p className="text-slate-400 text-sm mt-2">Authorized personnel only</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="admin@edu.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
          
          <button type="submit" className="w-full mt-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
