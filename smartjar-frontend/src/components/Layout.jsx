import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, SendIcon, TrendingUp, PiggyBank, ReceiptText, LayoutDashboard, ShieldAlert, Menu, X, ChevronRight, ArrowLeft } from 'lucide-react';

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        const handlePopState = (e) => {
            e.preventDefault();
            window.history.pushState(null, '', window.location.href);
            setShowLogoutModal(true);
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        }
    }, []);

    if (!user) {
        return children; // For login/register pages
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans">
            <div className="md:hidden bg-white w-full border-b border-slate-200 py-4 px-6 flex justify-between items-center fixed top-0 z-50">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">SJ</div>
                    <span className="font-bold text-slate-900">SmartJar</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-slate-900">
                    {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                </button>
            </div>

            <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 w-64 bg-white border-r border-slate-200 flex flex-col py-8 px-4 fixed h-screen z-40 top-0 pt-20 md:pt-8 overflow-y-auto`}>
                <div className="flex items-center space-x-3 px-4 mb-10">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                        <span className="text-white font-bold text-lg">SJ</span>
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">SmartJar</span>
                </div>
                
                <div className="space-y-1 flex-1">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">Vault & Assets</p>
                    <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={location.pathname === '/dashboard'} onClick={() => navigate('/dashboard')} />
                    <NavItem icon={<SendIcon size={20}/>} label="Transfer" active={location.pathname === '/send'} onClick={() => navigate('/send')} />
                    <NavItem icon={<TrendingUp size={20}/>} label="Gold Vault" active={location.pathname === '/gold'} onClick={() => navigate('/gold')} />
                    <NavItem icon={<PiggyBank size={20}/>} label="Auto Savings" active={location.pathname === '/savings'} onClick={() => navigate('/savings')}/>
                    <NavItem icon={<ReceiptText size={20}/>} label="Pay Bills" active={location.pathname === '/bills'} onClick={() => navigate('/bills')}/>
                    <NavItem icon={<Wallet size={20}/>} label="My Wallet" active={location.pathname === '/wallet'} onClick={() => navigate('/wallet')}/>
                    
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-3">Architecture</p>
                    <NavItem icon={<ShieldAlert size={20}/>} label="Security" active={location.pathname === '/settings'} onClick={() => navigate('/settings')}/>
                </div>

                <div className="border-t border-slate-100 pt-6 px-2 mt-4">
                    <div className="flex items-center space-x-3 px-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">@{user?.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}jar</p>
                        </div>
                    </div>
                    <button className="mt-4 w-full text-left px-4 py-2 text-sm text-slate-500 hover:text-red-600 font-bold transition-colors"
                        onClick={() => setShowLogoutModal(true)}>
                        Sign Out / Lock Vault
                    </button>
                </div>
            </div>

            <div className="flex-1 md:ml-64 w-full h-screen overflow-y-auto bg-slate-50 relative pb-20 md:pb-10">
                {/* Global Back Button Header */}
                {location.pathname !== '/dashboard' && (
                    <div className="sticky top-0 z-30 px-6 py-4 flex items-center bg-slate-50/80 backdrop-blur-md">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="group flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors bg-white/50 hover:bg-white p-2 pr-4 rounded-xl border border-slate-200 shadow-sm"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
                            <span className="text-xs font-bold uppercase tracking-wider">Return</span>
                        </button>
                    </div>
                )}
                {children}
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Vault Lock Warning</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Are you sure you want to securely log out of the SmartJar Vault? You will need your credentials to regain entry.</p>
                        
                        <div className="flex space-x-3">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex-1 bg-rose-600 text-white font-black py-3 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20">Sign Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavItem({icon, label, active, onClick}) {
    return (
        <div onClick={onClick} className={`flex items-center w-full px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className={`mr-3 ${active ? 'text-white' : 'text-slate-400'}`}>{icon}</span>
            <span className="font-bold text-sm tracking-wide">{label}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70"/>}
        </div>
    )
}
