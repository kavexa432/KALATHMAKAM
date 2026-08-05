import React, { useState, useEffect } from 'react';
import { Menu, X, User, Shield, LogOut } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { NotificationDrawer } from './NotificationDrawer';
import logoImage from '../../../assets/kalathmakam_2k26_logo.png';

interface NavbarProps {
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currentUser, logout } = useFestival();

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Events', href: '#events', id: 'events' },
    { name: 'Schedule', href: '#schedule', id: 'schedule' },
    { name: 'Results', href: '#results', id: 'results' },
    { name: 'Leaderboard', href: '#leaderboard', id: 'leaderboard' },
    { name: 'Gallery', href: '#gallery', id: 'gallery' },
    { name: 'Committee', href: '#committee', id: 'committee' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);

      const sections = navLinks.map((link) => link.id);
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220 && rect.bottom >= 220) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);

    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      window.location.hash = '#home';
      setActiveSection('home');
      return;
    }

    const el = document.getElementById(targetId);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 75;
      window.scrollTo({ top: topOffset, behavior: 'instant' as ScrollBehavior });
      window.location.hash = `#${targetId}`;
      setActiveSection(targetId);
    }
  };

  const isDev = currentUser?.role === 'developer' || currentUser?.role === 'Developer';
  const isAdmin = (currentUser?.role === 'admin' || currentUser?.role === 'Admin') && currentUser?.approved;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-nav py-2 shadow-xs' : 'bg-transparent py-3'
        }`}
      >
        <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-[76px] lg:h-[82px]">
            
            {/* Logo + Desktop Nav Container */}
            <div className="flex items-center">
              {/* Calligraphy Logo */}
              <a
                href="#home"
                onClick={(e) => handleNavClick(e, 'home')}
                className="flex items-center gap-2 group shrink-0 py-1"
              >
                <img
                  src={logoImage}
                  alt="Kalathmakam 2K26 Malayalam Calligraphy Official Logo"
                  className="h-14 sm:h-16 lg:h-[72px] xl:h-[76px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </a>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-7 xl:gap-9 ml-12 lg:ml-16">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.id)}
                      className={`relative font-sans-manrope text-[14px] font-semibold transition-colors duration-300 ${
                        isActive
                          ? 'text-[#FF5E84] font-bold'
                          : 'text-[#333333] hover:text-[#111111]'
                      }`}
                    >
                      {link.name}
                      {/* Reference Underline Motif: ──•── */}
                      {isActive && (
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-[2px]">
                          <div className="w-3.5 h-[1px] bg-[#FF5E84]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF5E84]" />
                          <div className="w-3.5 h-[1px] bg-[#FF5E84]" />
                        </div>
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Right Header Controls (Login Pill + Circular Menu Button) */}
            <div className="flex items-center gap-3 sm:gap-4 pr-2 sm:pr-4">
              
              {/* Desktop Auth Controls */}
              <div className="hidden lg:flex items-center gap-3">
                {currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="bg-white hover:bg-black/5 text-[#111111] font-sans-manrope font-bold text-xs px-4.5 py-2 rounded-full flex items-center gap-2.5 border border-black/10 shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-6.5 h-6.5 rounded-full border border-black/10" />
                      ) : (
                        <div className="w-6.5 h-6.5 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[11px]">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-left leading-tight">
                        <span className="block font-bold text-xs text-[#111111]">{currentUser.name.split(' ')[0]}</span>
                        <span className="block text-[10px] text-[#5F5F5F] font-semibold">
                          {isDev ? '🛡️ Developer' : isAdmin ? '🔒 Admin' : '👤 Member'}
                        </span>
                      </div>
                    </button>

                    {/* Premium Floating User Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 top-[calc(100%+12px)] w-72 bg-white/98 backdrop-blur-2xl rounded-[20px] p-4 shadow-2xl border border-black/10 text-left space-y-3 z-[9999] animate-in fade-in">
                        <div className="px-2 py-1 border-b border-black/8 pb-3">
                          <p className="font-bold text-xs text-[#111111] truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-[#5F5F5F] truncate">{currentUser.email}</p>
                        </div>

                        {(isDev || isAdmin) && (
                          <a
                            href="#control-center"
                            onClick={(e) => handleNavClick(e, 'control-center')}
                            className="w-full py-2.5 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-2 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span>{isDev ? 'Dashboard' : 'Festival Admin'}</span>
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full py-2.5 px-3.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Visitor Pink Bordered Login Button (Exact Reference Match) */
                  <button
                    onClick={onOpenLogin}
                    className="bg-white hover:bg-[#FF5E84]/5 text-[#111111] font-sans-manrope font-bold text-[14px] px-6 py-2 rounded-full flex items-center gap-2 cursor-pointer shadow-2xs border border-[#FF5E84] transition-all"
                  >
                    <User className="w-4 h-4 text-[#FF5E84]" />
                    <span>Login</span>
                  </button>
                )}
              </div>

              {/* Circular Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#111111] hover:text-[#FF5E84] shadow-2xs cursor-pointer transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Clean Integrated Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-[65px] bg-[#FAF8F5]/98 backdrop-blur-2xl border-b border-black/10 p-6 shadow-2xl animate-in fade-in max-h-[85vh] overflow-y-auto z-[9999]">
            <nav className="flex flex-col gap-2 text-left max-w-[1480px] mx-auto">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`text-sm font-bold py-2.5 px-4 rounded-xl transition-colors ${
                    activeSection === link.id
                      ? 'bg-[#FF5E84]/15 text-[#FF5E84]'
                      : 'text-[#333333] hover:bg-black/5'
                  }`}
                >
                  {link.name}
                </a>
              ))}

              <div className="h-[1px] bg-black/10 my-3" />

              {/* Account Profile & Actions */}
              {currentUser ? (
                <div className="p-4 rounded-2xl bg-white border border-black/10 space-y-3">
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-black/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center font-bold text-sm">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] truncate">
                        {currentUser.name}
                      </h4>
                      <p className="font-sans-manrope text-[11px] text-[#5F5F5F] truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0 ${
                        isDev
                          ? 'bg-blue-100 text-blue-800'
                          : isAdmin
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>

                  {(isDev || isAdmin) && (
                    <a
                      href="#control-center"
                      onClick={(e) => handleNavClick(e, 'control-center')}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{isDev ? 'Dashboard' : 'Festival Admin'}</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-red-50 text-red-600 font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-3 px-4 rounded-2xl gradient-btn-primary text-white font-sans-manrope font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Continue with Google / Login</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </>
  );
};
