import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Activity, Download, Search } from 'lucide-react';
import api from '../api/axiosConfig';

export default function TransactionHistory() {
    const navigate = useNavigate();
    const location = useLocation();
    const [history, setHistory] = useState([]);
    const [filter, setFilter] = useState(location.state?.searchQuery || '');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if(!user) return navigate('/login');
        const loadHistory = async () => {
            try {
                const hReq = await api.get(`/upi/history/${user.id}`);
                setHistory(hReq.data);
            } catch(e) { }
        };
        loadHistory();
    }, [user?.id, navigate]);

    const filteredHistory = history.filter(tx => 
        tx.transactionType.toLowerCase().includes(filter.toLowerCase()) || 
        (tx.id && tx.id.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="w-full flex flex-col animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 shadow-md flex items-center justify-between z-10 md:rounded-b-[2.5rem] md:mx-4 mb-4">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Full Ledger</h1>
                        <p className="text-slate-400 text-sm font-medium">Comprehensive Transaction History</p>
                    </div>
                </div>
                <button onClick={async () => {
                    try {
                        await api.post(`/analytics/report/${user.id}`);
                        alert("Report successfully dispatched to your email!");
                    } catch(e) {
                        alert("Failed to export report.");
                    }
                }} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                    <Download size={16} /> <span className="hidden sm:inline">Export Email Report</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full">
                
                {/* Search / Filters */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by ID or Type (e.g. UPI, GOLD)..." 
                        className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {filteredHistory.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 font-medium">No transactions found matching your criteria.</div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                        <th className="p-5 whitespace-nowrap">Time & Date</th>
                                        <th className="p-5">Transaction ID</th>
                                        <th className="p-5">Type / Context</th>
                                        <th className="p-5">Sender & Receiver</th>
                                        <th className="p-5 text-right">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...filteredHistory].reverse().map((tx, i) => {
                                        const isDebit = ['WALLET_TOPUP', 'GOLD_LIQUIDATION'].includes(tx.transactionType) ? false : (['GOLD_PURCHASE', 'GOLD_SAVINGS_SWEEP'].includes(tx.transactionType) || tx.transactionType.startsWith('BILL_PAYMENT') ? true : tx.senderId === user.id);
                                        return (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-5 whitespace-nowrap">
                                                    <p className="font-bold text-slate-800">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                                                </td>
                                                <td className="p-5 align-middle">
                                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 block w-min whitespace-nowrap">{tx.id || "LEGACY-TX-000"}</span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDebit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            <Activity size={14}/>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-700 text-sm capitalize">{tx.transactionType.replace(/_/g, ' ')}</p>
                                                            <p className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-max mt-1 border ${isDebit ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                                                {isDebit ? 'DEBIT' : 'CREDIT'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <p className="text-xs font-bold text-slate-500 uppercase">From: <span className="text-slate-800 normal-case">{tx.senderDetails || "Legacy Address"}</span></p>
                                                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">To: <span className="text-slate-800 normal-case">{tx.receiverDetails || "Legacy Address"}</span></p>
                                                </td>
                                                <td className="p-5 text-right font-black text-lg align-middle whitespace-nowrap">
                                                    <span className={isDebit ? 'text-rose-600' : 'text-emerald-600'}>
                                                        {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
