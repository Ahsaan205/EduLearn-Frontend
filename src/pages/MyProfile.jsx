import { useState } from 'react';
import { Mail, Phone, MapPin, User, Calendar, Edit2, Save, Camera, ChevronDown, ShieldCheck, Key, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const MyProfile = () => {
  const { user, login } = useAuth();
  const [doedit, setDoEdit] = useState(false);
  const [userData, setUserData] = useState(user);
  const [image, setImage] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters long.");
    }
    if (oldPassword === newPassword) {
      return toast.error("New password must be different from current password.");
    }

    setIsSubmittingPassword(true);
    try {
      const res = await api.post('/auth/change-password', { oldPassword, newPassword });
      toast.success(res.data.message || "Password updated successfully!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const UpdateUserProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('name', userData.name || '');
      if (userData.age) formData.append('age', userData.age);
      if (userData.gender) formData.append('gender', userData.gender);
      if (userData.phone) formData.append('phone', userData.phone);
      if (userData.address) formData.append('address', userData.address);
      if (image) formData.append('image', image);

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      login(res.data.user, localStorage.getItem('token'));
      setDoEdit(false);
      setImage(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="glass-panel overflow-hidden border border-slate-700">
        <div className="h-32 bg-slate-800 relative border-b border-slate-700">
          <div className="absolute -bottom-12 left-8 relative group inline-block">
            {doedit ? (
              <label htmlFor="image" className="cursor-pointer">
                <div className="relative">
                  <img
                    src={image ? URL.createObjectURL(image) : (userData.image || `https://ui-avatars.com/api/?name=${userData.name}&background=0f172a&color=38bdf8`)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-slate-900 object-cover shadow-lg bg-slate-900"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full border-4 border-transparent flex items-center justify-center transition-all hover:bg-black/60">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
              </label>
            ) : (
              <img
                src={userData.image || `https://ui-avatars.com/api/?name=${userData.name}&background=0f172a&color=38bdf8`}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-slate-900 object-cover shadow-lg bg-slate-900"
              />
            )}
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
            <div>
              {doedit ? (
                <input
                  type="text"
                  value={userData.name}
                  onChange={e => setUserData({ ...userData, name: e.target.value })}
                  className="text-2xl sm:text-3xl font-extrabold text-white bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-full max-w-[300px] transition-all"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {userData.name}
                </h1>
              )}
            </div>

            <div>
              {doedit ? (
                <button
                  onClick={UpdateUserProfile}
                  className="flex items-center gap-2 btn-primary shadow-sm w-full sm:w-auto justify-center"
                >
                  <Save size={16} /> Save Profile
                </button>
              ) : (
                <button
                  onClick={() => setDoEdit(true)}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-700 hover:text-white transition-colors shadow-sm w-full sm:w-auto justify-center"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 pb-2 border-b border-slate-800">
                Contact Information
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-800 p-2 rounded-lg text-blue-400 shrink-0 border border-slate-700">
                    <Mail size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Email</p>
                    <p className="text-sm text-slate-300 font-medium truncate">{userData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-slate-800 p-2 rounded-lg text-blue-400 shrink-0 border border-slate-700">
                    <Phone size={16} />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Phone</p>
                    {doedit ? (
                      <input
                        type="text"
                        value={userData.phone || ''}
                        onChange={e => setUserData({ ...userData, phone: e.target.value })}
                        className="w-full text-sm bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all font-medium"
                      />
                    ) : (
                      <p className="text-sm text-slate-300 font-medium">{userData.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-slate-800 p-2 rounded-lg text-blue-400 shrink-0 border border-slate-700">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Address</p>
                    {doedit ? (
                      <textarea
                        value={userData.address || ''}
                        onChange={e => setUserData({ ...userData, address: e.target.value })}
                        rows={3}
                        className="w-full text-sm bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white resize-none transition-all font-medium"
                      />
                    ) : (
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">{userData.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 pb-2 border-b border-slate-800">
                Basic Information
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-800 p-2 rounded-lg text-blue-400 shrink-0 border border-slate-700">
                    <User size={16} />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Gender</p>
                    {doedit ? (
                      <div className="relative w-full group">
                        <select
                          value={userData.gender || 'Not Selected'}
                          onChange={e => setUserData({ ...userData, gender: e.target.value })}
                          className="w-full text-sm bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white cursor-pointer appearance-none pr-8 transition-all font-medium [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="Not Selected" disabled>Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-all pointer-events-none" size={16} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300 font-medium">{userData.gender || 'Not Selected'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-slate-800 p-2 rounded-lg text-blue-400 shrink-0 border border-slate-700">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Age</p>
                    {doedit ? (
                      <input
                        type="number"
                        value={userData.age || ''}
                        onChange={e => setUserData({ ...userData, age: e.target.value })}
                        className="w-full text-sm bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all font-medium"
                      />
                    ) : (
                      <p className="text-sm text-slate-300 font-medium">{userData.age ? `${userData.age} Years` : 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Security Settings
            </h2>
            
            {!showChangePassword ? (
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700 hover:text-white transition-colors shadow-sm cursor-pointer"
              >
                <Key size={14} /> Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="mt-4 p-5 bg-slate-800/30 border border-slate-700 rounded-2xl flex flex-col gap-4 max-w-md animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Password</h3>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-rose-400 uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <Key size={10} /> Current Password
                  </label>
                  <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl focus-within:border-blue-500 transition-all">
                    <input 
                      type={showOld ? "text" : "password"} 
                      required 
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)} 
                      placeholder="Enter current password"
                      className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-white outline-none"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="p-2 text-slate-500 hover:text-blue-400 cursor-pointer">
                      {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">
                    <Lock size={10} /> New Password
                  </label>
                  <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl focus-within:border-blue-500 transition-all">
                    <input 
                      type={showNew ? "text" : "password"} 
                      required 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Min 8 characters"
                      className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-white outline-none"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="p-2 text-slate-500 hover:text-blue-400 cursor-pointer">
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">
                    <ShieldCheck size={10} /> Confirm Password
                  </label>
                  <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl focus-within:border-blue-500 transition-all">
                    <input 
                      type={showConfirm ? "text" : "password"} 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Retype new password"
                      className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-white outline-none"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="p-2 text-slate-500 hover:text-blue-400 cursor-pointer">
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingPassword || !oldPassword || !newPassword || !confirmPassword} 
                  className="w-full py-2.5 rounded-xl btn-primary text-xs font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 shadow-sm cursor-pointer mt-2"
                >
                  {isSubmittingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
