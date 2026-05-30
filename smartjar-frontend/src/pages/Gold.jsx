import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Sparkles, Activity } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Gold() {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [walletBal, setWalletBal] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchGoldData = async () => {
            try {
                const [pRes, portRes, wRes, hRes] = await Promise.all([
                    api.get('/gold/price'),
                    api.get(`/gold/portfolio/${user.id}`),
                    api.get(`/wallet/${user.id}`),
                    api.get(`/upi/history/${user.id}`)
                ]);
                setPrice(pRes.data);
                setPortfolio(portRes.data);
                setWalletBal(wRes.data.balance);
                setTransactions(hRes.data);
            } catch (err) {
                console.error("Gold metrics fetch failed");
            }
        };
        fetchGoldData();
    }, []);

    const [inputType, setInputType] = useState('inr'); // 'inr' or 'grams'
    const [mode, setMode] = useState('buy');

    // Auto-swap input defaults based on mode
    useEffect(() => {
        setInputType(mode === 'buy' ? 'inr' : 'grams');
        setAmount('');
    }, [mode]);

    const executeTrade = async () => {
        if(!amount || amount <= 0 || !price) return alert(`Enter valid amount. Waiting for live price...`);
        setLoading(true);
        try {
            if (mode === 'buy') {
                // Backend Buy expects INR
                let finalInr = inputType === 'inr' ? parseFloat(amount) : parseFloat(amount) * price.pricePerGram;
                const res = await api.post('/gold/buy', { userId: user.id, amount: finalInr });
                alert(`Success! You securely accumulated ${res.data.goldBoughtGrams}g of 24K Gold!`);
            } else {
                // Backend Sell expects Grams
                let finalGrams = inputType === 'grams' ? parseFloat(amount) : parseFloat(amount) / price.pricePerGram;
                const res = await api.post('/gold/sell', { userId: user.id, grams: finalGrams });
                alert(`Success! Liquidated ${res.data.goldSoldGrams}g for ₹${res.data.cashReceived} back to wallet.`);
            }
            navigate('/dashboard');
        } catch (e) {
            alert(e.response?.data?.message || "Trade failed - verify balance.");
        } finally {
            setLoading(false);
        }
    };

    const inrVal = inputType === 'inr' ? amount : (amount * price?.pricePerGram);
    const gramVal = inputType === 'grams' ? amount : (amount / price?.pricePerGram);

    return (
        <div className="p-4 pt-24 md:pt-10 w-full animate-[fadeIn_0.3s_ease]">
            <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-8 text-white relative flex flex-col justify-center text-center sm:text-left">
                    <div className="mt-8">
                        <p className="text-amber-100 text-sm font-semibold tracking-wider flex items-center mb-2">Live Gold Vault <Sparkles className="w-4 h-4 ml-2"/></p>
                        <h2 className="text-4xl font-black mb-1">{portfolio?.totalGrams ? parseFloat(portfolio.totalGrams).toFixed(4) : '0.000'}g</h2>
                        <h3 className="text-amber-200 font-bold tracking-wide">Current Value: ₹{portfolio?.currentValue || '0.00'}</h3>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl mb-6">
                        <button onClick={() => setMode('buy')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'buy' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Invest (Buy)</button>
                        <button onClick={() => setMode('sell')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'sell' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Withdraw (Sell)</button>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-5 flex items-center justify-between border border-amber-100 mb-8">
                        <div>
                            <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1 leading-tight">Live Market</p>
                            <p className="text-sm font-medium text-amber-700">24K 99.9% Purity</p>
                        </div>
                        <div className="text-right flex items-center">
                            <Activity className="w-4 h-4 text-emerald-500 mr-2" />
                            <p className="text-xl font-bold text-amber-900">₹{price?.pricePerGram || '---'} <span className="text-sm font-semibold text-amber-700">/ g</span></p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Amount in {inputType === 'inr' ? 'INR (₹)' : 'Grams (g)'}</label>
                                <button onClick={() => setInputType(inputType === 'inr' ? 'grams' : 'inr')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md transition-colors">
                                    Switch to {inputType === 'inr' ? 'Grams' : 'INR'}
                                </button>
                            </div>
                            
                            <input type="number" placeholder="0.00" className="w-full p-4 border border-slate-200 rounded-xl text-2xl font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow bg-white" 
                                value={amount} onChange={e => setAmount(e.target.value)} />
                            {mode === 'buy' && (
                                <p className="text-xs font-semibold text-slate-500 mt-2 text-right">
                                    Wallet Balance: <span className="text-amber-600">₹{walletBal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </p>
                            )}
                        </div>
                        
                        <div className="flex justify-between text-sm font-bold bg-slate-50 px-4 py-3 rounded-xl text-slate-600 border border-slate-200 shadow-inner">
                            <span>You will {mode === 'buy' ? 'get' : 'receive'}:</span>
                            <span className="text-amber-600">
                                {amount && price?.pricePerGram ? (mode === 'buy' ? `${gramVal ? gramVal.toFixed(4) : '0.0000'} g` : `₹${inrVal ? inrVal.toFixed(2) : '0.00'}`) : '---'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-10">
                        <button onClick={executeTrade} disabled={loading} className={`w-full text-white font-bold p-5 rounded-2xl shadow-lg disabled:opacity-50 flex justify-center items-center overflow-hidden transition-transform active:scale-[0.98] ${mode === 'buy' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'}`}>
                            <TrendingUp className={`w-5 h-5 mr-3 ${mode === 'sell' && 'rotate-180'}`} />
                            {loading ? 'Executing Order...' : (mode === 'buy' ? `Buy ${gramVal ? gramVal.toFixed(4) : 0}g Gold` : `Liquidate ₹${inrVal ? inrVal.toFixed(2) : 0} to Wallet`)}
                        </button>
                    </div>
                </div>
            </div>

            {/* Vault History Section */}
            <div className="w-full max-w-xl mx-auto mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-black text-slate-900 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-amber-600" />
                        Vault Ledger
                    </h3>
                    <button onClick={() => navigate('/history')} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">See all</button>
                </div>
                <div className="p-4 space-y-2">
                    {(() => {
                        const goldTx = transactions
                            .filter(tx => ['GOLD_PURCHASE', 'GOLD_LIQUIDATION', 'GOLD_SAVINGS_SWEEP'].includes(tx.transactionType))
                            .slice(0, 5);
                        
                        if (goldTx.length === 0) return <p className="text-center py-10 text-slate-400 font-bold text-sm">No vault activity recorded globally yet.</p>;

                        return goldTx.map((tx, i) => {
                            const isLiquidate = tx.transactionType === 'GOLD_LIQUIDATION';
                            return (
                                <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLiquidate ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <TrendingUp className={`w-4 h-4 ${isLiquidate && 'rotate-180'}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm capitalize">{tx.transactionType.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black text-sm ${isLiquidate ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {isLiquidate ? '+' : '-'}₹{tx.amount}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 italic">Settled</p>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>
        </div>
    )
}
