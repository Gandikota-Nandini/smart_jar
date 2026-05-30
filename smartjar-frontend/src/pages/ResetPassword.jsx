import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import api from '../api/axiosConfig';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert("Passwords do not match!");
        
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { 
                email: email.toLowerCase().trim(), 
                otp: otp.trim(), 
                newPassword: newPassword 
            });
            alert('Password restored successfully! Please log in with your new credentials.');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Password reset failed. Please check your OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl border border-slate-100">
                <button onClick={() => navigate('/forgot-password')} className="flex items-center text-slate-400 font-bold text-xs mb-8 hover:text-slate-600 transition-colors uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Change Email
                </button>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mx-auto mb-6">
                        <KeyRound className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Set New Password</h2>
                    <p className="text-slate-500 font-medium text-sm mt-2">Update your gateway credentials for <b>{email}</b></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1 tracking-wider">Recovery OTP</label>
                        <input type="text" placeholder="••••••" maxLength="6" value={otp} onChange={e => setOtp(e.target.value)}
                            className="w-full p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-2xl font-black tracking-[0.5em] text-center text-emerald-900 focus:border-emerald-500 transition-all outline-none" required />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                                <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Confirm New Password</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                                <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium" required />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-3">
                        <RefreshCw className={`w-5 h-5 ${loading && 'animate-spin'}`} />
                        <span>{loading ? 'Restoring Access...' : 'Finalize Password'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
