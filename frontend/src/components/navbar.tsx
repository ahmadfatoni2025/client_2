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
    window.addEventListener('scroll', handleScroll);
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
    // Implement search logic
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${scrolled ? 'shadow-md' : ''}`}
      style={{ transform: scrolled ? 'translateY(-70px)' : 'translateY(0)' }}
    >
      {/* Top Bar - Fixed height to prevent layout jumps */}
      <div className="h-[70px] flex items-center justify-between px-6 border-b border-gray-100">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-3 pl-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
          >
            <Menu size={20} />
          </button>
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
              <div className="text-white font-bold text-sm">SPPG</div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-gray-800 font-semibold text-base leading-tight">Kepala SPPG</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-[11px]">admin@gmail.com</span>
                <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3 pr-3">
          <form onSubmit={handleSearch} className="hidden lg:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Temukan di sini..."
              className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 w-64 transition-all"
            />
          </form>

          <button
            onClick={() => navigate('/search')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <Search size={20} />
          </button>

          <button
            onClick={handleNotifications}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-medium text-xs">AF</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Stays visible at top:0 when parent is translated */}
      <nav className="px-6 bg-white border-b border-gray-100">
        <div className="flex items-center overflow-x-auto scrollbar-hide py-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.name;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 relative
                  ${isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                  }
                `}
              >
                <div className={`${isActive ? 'text-blue-600' : 'text-gray-400 opacity-70'}`}>
                  {item.icon}
                </div>
                <span>{item.displayName}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full shadow-[0_-1px_4px_rgba(37,99,235,0.3)]" />
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