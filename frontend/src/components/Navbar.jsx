import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  Search,
  Trophy,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/browse', label: 'Browse', icon: Search },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/mentors', label: 'Mentors', icon: User },
    { to: '/developers', label: 'Developers', icon: User },
  ];

  const authLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'glass-header py-2' : 'bg-transparent py-4'
    }`}>
      <div className="wrapper">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-white font-display font-bold text-xl shadow-glow transition-transform group-hover:scale-110">SF</div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-brand-orange transition-colors">
              SkillFlare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-all"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle - Hidden for now as we are dark-first, but kept for logic */}
            {/* <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button> */}

            {isAuthenticated ? (
              /* Profile dropdown */
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-full bg-brand-surface border border-brand-border hover:border-brand-orange/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-brand-card border border-brand-border rounded-xl shadow-xl py-2 animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-brand-border mb-2 bg-brand-surface/50">
                      <p className="font-bold text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                      <span className={`mt-2 inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        user?.role === 'teacher' ? 'bg-brand-orange/20 text-brand-orange' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user?.role}
                      </span>
                    </div>
                    
                    <Link
                      to="/post-task"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-brand-orange transition-colors"
                    >
                      <PlusCircle size={18} />
                      <span>Post Task</span>
                    </Link>

                    <div className="h-px bg-brand-border my-2 mx-4" />

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth buttons */
              <div className="hidden sm:flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-6 py-2 text-sm">
                  Join Us
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-300 hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 rounded-2xl bg-brand-card border border-brand-border animate-slide-up">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl"
                >
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  {authLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl"
                    >
                      <link.icon size={20} />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                  <div className="h-px bg-brand-border my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-3 border-t border-brand-border mt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-secondary w-full"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary w-full shadow-glow"
                  >
                    Join Us
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
