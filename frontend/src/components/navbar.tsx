import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Home, Package, Utensils, DollarSign, Settings, Menu, Beef } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  const navItems = [
    { name: 'dashboard', displayName: 'Dashboard', icon: <Home size={18} />, path: '/dashboard' },
    { name: 'inventory', displayName: 'Inventory', icon: <Package size={18} />, path: '/inventory' },
    { name: 'nutrisi', displayName: 'Nutrisi', icon: <Beef size={18} />, path: '/nutrisi' },
    { name: 'dapur', displayName: 'Dapur', icon: <Utensils size={18} />, path: '/dapur' },
    { name: 'keuangan', displayName: 'Keuangan', icon: <DollarSign size={18} />, path: '/keuangan' },
    { name: 'pengaturan', displayName: 'Pengaturan', icon: <Settings size={18} />, path: '/pengaturan' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ease-in-out ${scrolled ? 'shadow-md shadow-gray-200/50' : ''}`}
    >
      {/* Top Bar - On desktop it hides on scroll, on mobile it stays or adjusts */}
      <div
        className={`flex items-center justify-between px-6 border-b border-gray-100 transition-all duration-300 overflow-hidden ${scrolled ? 'h-0 opacity-0 md:h-[70px] md:opacity-100' : 'h-[70px] opacity-100'}`}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
          >
            <Menu size={20} />
          </button>
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="text-white font-bold text-sm tracking-tighter">MBG</div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-gray-800 font-bold text-base leading-tight">Kepala SPPG</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[10px] font-medium">admin@mbg.id</span>
                <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                <span className="text-blue-600 text-[9px] font-black uppercase tracking-widest">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden lg:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari data..."
              className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-64 transition-all placeholder:text-gray-300"
            />
          </form>

          <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="h-8 w-[1px] bg-gray-100 mx-1 hidden md:block"></div>

          <button
            onClick={() => navigate('/pengaturan')}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-[10px]">AF</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="px-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center overflow-x-auto scrollbar-hide py-1 gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.name;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-all duration-300 relative rounded-xl
                  ${isActive
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 opacity-60'} transition-transform`}>
                  {item.icon}
                </div>
                <span className="tracking-tight">{item.displayName}</span>
                {isActive && (
                  <div className="absolute bottom-1.5 left-5 right-5 h-0.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;