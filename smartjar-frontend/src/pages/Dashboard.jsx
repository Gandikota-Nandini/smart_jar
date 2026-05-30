import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, QrCode, SendIcon, TrendingUp, PiggyBank, ReceiptText, Sparkles, Activity, Bell, Search, LayoutDashboard, ShieldAlert } from 'lucide-react';
import api from '../api/axiosConfig';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
    const [walletBal, setWalletBal] = useState(0);
    const [history, setHistory] = useState([]);
    const [insights, setInsights] = useState([]);
    const [totalGold, setTotalGold] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {

    }, []);

    useEffect(() => {
        if (!user) return navigate('/login');
        const loadData = async () => {
            try {
                const [wReq, hReq, iReq, gReq] = await Promise.all([
                    api.get(`/wallet/${user.id}`),
                    api.get(`/upi/history/${user.id}`),
                    api.get(`/insights/${user.id}`),
                    api.get(`/gold/portfolio/${user.id}`)
                ]);
                setWalletBal(wReq.data.balance);
                setHistory(hReq.data);
                setInsights(iReq.data);
                setTotalGold(gReq.data.totalGrams);
            } catch (e) { console.error("Error loading dashboard metrics"); }
        };
        loadData();
    }, [user?.id, navigate]);

    const processCharts = () => {
        if (history.length === 0) return { 
            trend: [{ name: 'Init', balance: walletBal }], 
            categories: [{ name: 'No Data', value: 1, color: '#f1f5f9' }] 
        };

        // 1. Calculate Balance Trend
        const sortedHistory = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        let runningBalance = walletBal;
        const trend = [];
        
        // We start from current and work backwards to find historical points
        const reversedHistory = [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        let tempBal = walletBal;
        const historyPoints = [];
        
        reversedHistory.forEach(tx => {
            const isDebit = ['WALLET_TOPUP', 'GOLD_LIQUIDATION'].includes(tx.transactionType) ? false : (['GOLD_PURCHASE', 'GOLD_SAVINGS_SWEEP'].includes(tx.transactionType) || tx.transactionType.startsWith('BILL_PAYMENT') ? true : tx.senderId === user.id);
            historyPoints.push({ name: new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), balance: tempBal });
            if (isDebit) tempBal += tx.amount; else tempBal -= tx.amount;
        });
        
        // 2. Aggregate Categories
        const catMap = {};
        history.forEach(tx => {
            let cat = "Other";
            if (tx.transactionType.includes("UPI") || tx.transactionType.includes("P2P")) cat = "Transfers";
            else if (tx.transactionType.includes("GOLD")) cat = "Investments";
            else if (tx.transactionType.includes("BILL")) cat = "Utilities";
            else if (tx.transactionType.includes("WALLET")) cat = "Topups";
            
            catMap[cat] = (catMap[cat] || 0) + tx.amount;
        });

        const categories = Object.keys(catMap).map(name => ({
            name, 
            value: catMap[name],
            color: name === 'Investments' ? '#f59e0b' : (name === 'Transfers' ? '#4f46e5' : (name === 'Utilities' ? '#f43f5e' : '#10b981'))
        }));

        return { trend: historyPoints.reverse(), categories };
    };

    const { trend, categories } = processCharts();

    return (
        <div className="p-4 md:p-10 pt-24 md:pt-10 max-w-7xl mx-auto w-full animate-[fadeIn_0.3s_ease]">
            {/* Top Navigation */}
            <div className="flex justify-end items-center mb-10">
                <div className="flex items-center space-x-4">
                    <button className="relative w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>
            </div>

            {/* Header Greeting */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Overview</h2>
                <p className="text-slate-500 mt-1">Here is a summary of your automated finances.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Primary Balance Widget */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md">Live</span>
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium text-sm mb-1">Total Balance</p>
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">₹{walletBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-amber-600 p-8 rounded-3xl shadow-xl lg:col-span-2 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">SmartJar Vault & Savings</h3>
                            <p className="text-amber-100 text-sm max-w-sm mb-6">Manage your Jar, add to your savings, or invest in pure 24K Gold directly from your wallet.</p>
                            <div className="flex space-x-3">
                                <button onClick={() => navigate('/send')} className="bg-amber-800 hover:bg-amber-900 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-amber-900/30">Transfer Money</button>
                                <button onClick={() => navigate('/wallet')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors border border-white/10">Add Funds</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                            <ShortcutBtn icon={<SendIcon />} label="Pay UPI ID" onClick={() => navigate('/send')} />
                            <ShortcutBtn icon={<Wallet />} label="To Bank Account" onClick={() => navigate('/send')} />
                            <ShortcutBtn icon={<ReceiptText />} label="Pay Bills" onClick={() => navigate('/bills')} />
                            <ShortcutBtn icon={<QrCode />} label="Receive Money" onClick={() => navigate('/qr')} />
                            <ShortcutBtn icon={<TrendingUp />} label="Buy Gold" onClick={() => navigate('/gold')} />
                            <ShortcutBtn icon={<PiggyBank />} label="Jar Savings" onClick={() => navigate('/savings')} />
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Module */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-slate-900 text-lg">Cashflow Analytics</h3>
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500">
                            <option>This Week</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                    <div className="w-full h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientFlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                <Tooltip cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', color: '#1e293b', fontSize: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val) => [`₹${val.toLocaleString()}`, 'Balance Trend']}
                                />
                                <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={4} fill="url(#gradientFlow)" activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 4, className: "animate-pulse" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Spending Breakdown Doughnut */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-widest">Spending Profile</h3>
                        <div className="w-full h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categories} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                                        {categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                                <p className="text-sm font-black text-slate-900">₹{categories.reduce((acc, c) => acc + c.value, 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-2">
                             {categories.slice(0, 4).map((c, i) => (
                                 <div key={i} className="flex items-center space-x-2">
                                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                                     <span className="text-[10px] font-bold text-slate-500 uppercase">{c.name}</span>
                                 </div>
                             ))}
                        </div>
                    </div>

                    {/* Insights Mini Card */}
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600"><Sparkles className="w-5 h-5" /></div>
                        <div>
                            <h4 className="font-bold text-indigo-900 text-sm mb-1">Smart Digest</h4>
                            <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                                {insights.length > 0 ? insights[0] : "You are currently optimizing your recurring expenditures successfully."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wide Landscape Ledger at the Bottom */}
            <div className="mt-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full animate-[fadeIn_0.4s_ease]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 className="font-black text-slate-900 text-xl tracking-tight">Financial Ledger</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Recent Activity & Mini-Statements</p>
                    </div>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-300" />
                            <input type="text" placeholder="Filter activity..." value={localSearchTerm} onChange={e => setLocalSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                        </div>
                        <button onClick={() => navigate('/history')} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100 flex-shrink-0">Full History</button>
                    </div>
                </div>

                <div className="space-y-1">
                    {(() => {
                        const recentLocalHistory = history;
                        const filtered = recentLocalHistory.filter(tx => (tx.transactionType && tx.transactionType.toLowerCase().includes(localSearchTerm.toLowerCase())) || (tx.id && tx.id.toLowerCase().includes(localSearchTerm.toLowerCase())));
                        return filtered.length === 0 ? <p className="text-slate-400 font-medium text-sm text-center py-12">No matching transactions found.</p> : filtered.slice(0, 6).map((tx, i) => {
                            const isDebit = ['WALLET_TOPUP', 'GOLD_LIQUIDATION'].includes(tx.transactionType) ? false : (['GOLD_PURCHASE', 'GOLD_SAVINGS_SWEEP'].includes(tx.transactionType) || tx.transactionType.startsWith('BILL_PAYMENT') ? true : tx.senderId === user.id);
                            return (
                                <div key={i} className="group flex justify-between items-center p-4 hover:bg-slate-50/80 rounded-2xl transition-all cursor-pointer border-b border-slate-50 last:border-0" onClick={() => navigate('/history')}>
                                    <div className="flex items-center space-x-6 flex-1">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${isDebit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            <Activity size={20} />
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div>
                                                <p className="font-black text-slate-800 text-base capitalize tracking-tight">{tx.transactionType.replace(/_/g, ' ')}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reference: {tx.id.substring(0, 12).toUpperCase()}</p>
                                            </div>
                                            <div className="hidden md:flex flex-col items-start md:items-end justify-center">
                                                <p className="text-xs font-bold text-slate-500 uppercase">{new Date(tx.createdAt).toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'})}</p>
                                                <p className="text-[10px] font-medium text-slate-400">{new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right ml-8">
                                        <p className={`font-black text-lg tabular-nums ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                        </p>
                                        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${isDebit ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {isDebit ? 'Debit' : 'Credit'}
                                        </span>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>
        </div>
    );
}

function ShortcutBtn({ icon, label, onClick }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl p-4 transition-all">
            <div className="text-amber-200 mb-2">{icon}</div>
            <span className="text-xs font-semibold text-white tracking-wide">{label}</span>
        </button>
    )
}
