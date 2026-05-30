import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import api from '../api/axiosConfig';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: email.toLowerCase().trim() });
            alert('Reset OTP sent to your email (Verify in console if SMTP is local/mock).');
            navigate(`/reset-password?email=${encodeURIComponent(email.toLowerCase().trim())}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to initiate password reset.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl border border-slate-100">
                <button onClick={() => navigate('/login')} className="flex items-center text-slate-400 font-bold text-xs mb-8 hover:text-slate-600 transition-colors uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </button>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mx-auto mb-6">
                        <Mail className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recovery Portal</h2>
                    <p className="text-slate-500 font-medium text-sm mt-2">Enter your secured email to receive a recovery code.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1 tracking-wider">Registered Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                            <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium" required />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center space-x-3">
                        <Send className="w-5 h-5" />
                        <span>{loading ? 'Sending Code...' : 'Send Recovery Code'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
