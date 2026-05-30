import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PiggyBank, Settings, ShieldCheck, Zap, Activity, Sparkles } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Savings() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [totalSaved, setTotalSaved] = useState(0);
    const [rules, setRules] = useState([
        { id: 1, type: "Round-up to Nearest ₹10", active: true, tag: "POPULAR" },
        { id: 2, type: "Daily ₹50 Auto-Save", active: false },
        { id: 3, type: "Save 5% of Spend", active: false }
    ]);
    const [history, setHistory] = useState([]);

    const toggleRule = (id) => {
        const newRules = rules.map(r => r.id === id ? { ...r, active: !r.active } : r);
        setRules(newRules);
        localStorage.setItem('savingsRules', JSON.stringify(newRules));
    }

    useEffect(() => {
        const stored = localStorage.getItem('savingsRules');
        if (stored) setRules(JSON.parse(stored));
        
        api.get(`/savings/total/${user.id}`).then(res => {
            setTotalSaved(res.data.total); 
        });

        api.get(`/upi/history/${user.id}`).then(res => {
            setHistory(res.data);
        });
    }, [user.id]);

    return (
        <div className="p-4 pt-24 md:pt-10 w-full animate-[fadeIn_0.3s_ease]">
            <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
                
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-white relative text-center sm:text-left">
                    
                    <div className="absolute right-[-20%] top-[-20%] opacity-10">
                        <PiggyBank className="w-64 h-64" />
                    </div>

                    <div className="mt-8 relative z-10 flex flex-col items-start">
                        <span className="bg-emerald-500/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-emerald-400">Micro Savings Engine</span>
                        <p className="text-emerald-100 font-medium mb-1">Total Spare Change Saved</p>
                        <h2 className="text-5xl font-black tracking-tighter">₹{totalSaved.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-end mb-6">
                        <h3 className="text-xl font-extrabold text-gray-900">Active Autopilot Rules</h3>
                        <Settings className="w-5 h-5 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors" />
                    </div>

                    <div className="space-y-4">
                        {rules.map((rule) => (
                            <div key={rule.id} className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${rule.active ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`} onClick={() => toggleRule(rule.id)}>
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${rule.active ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${rule.active ? 'text-emerald-900' : 'text-gray-600'}`}>{rule.type}</h4>
                                        {rule.tag && <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block">{rule.tag}</span>}
                                    </div>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 transition-colors ${rule.active ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${rule.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start space-x-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm">Military Grade Encryption</h4>
                            <p className="text-xs text-blue-700 leading-relaxed mt-1">Your auto-savings logic is tied instantly bypassing third-party queues directly securely to your Gold Vault portfolio.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Savings History Log */}
            <div className="w-full max-w-xl mx-auto mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
                    <h3 className="font-black text-slate-800 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-emerald-600" />
                        Savings Activity
                    </h3>
                    <button onClick={() => navigate('/history')} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">History</button>
                </div>
                <div className="p-4 space-y-2">
                    {(() => {
                        const savingsLog = history
                            .filter(tx => tx.transactionType === 'GOLD_SAVINGS_SWEEP')
                            .slice(0, 5);
                        
                        if (savingsLog.length === 0) return <p className="text-center py-10 text-slate-400 font-bold text-sm italic">Accumulate spare change to see autopilot transactions here.</p>;

                        return savingsLog.map((tx, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-emerald-50/30 rounded-xl transition-all border border-transparent hover:border-emerald-100/50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100/50 text-emerald-600 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Auto-Invest Sweep</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm text-emerald-600">+₹{tx.amount}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase">Invested in Gold</p>
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>
        </div>
    );
}
