import React, { useState, useEffect } from 'react';
import { Menu, X, User, Shield, Lock, LogOut } from 'lucide-react';
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
    { name: 'Sponsors', href: '#sponsors', id: 'sponsors' },
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

  // Instant redirect / view jump handler without long smooth-scrolling delay
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

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
  const isNormalUser = currentUser && !isDev && !isAdmin;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'glass-nav py-1.5 shadow-xs' : 'bg-transparent py-2 sm:py-2.5'
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[65px] sm:h-[70px] lg:h-[75px]">
            
            {/* Official Custom Malayalam Calligraphy Logo Image */}
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, 'home')}
              className="flex items-center gap-2 group shrink-0 py-0.5"
            >
              <img
                src={logoImage}
                alt="Kalathmakam 2K26 Malayalam Calligraphy Official Logo"
                className="h-16 sm:h-20 lg:h-[100px] absolute top-1 sm:top-2 lg:-top-1 left-2 sm:left-4 lg:left-8 w-auto max-w-none object-contain transition-transform duration-300 group-hover:scale-105 origin-top-left"
              />
            </a>

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id)}
                    className={`relative font-sans-manrope text-[13px] font-semibold transition-colors duration-300 ${
                      isActive
                        ? 'text-[#FF5E84] font-bold'
                        : 'text-[#333333] hover:text-[#111111]'
                    }`}
                  >
                    {link.name}
                    {/* Active Link Underline Indicator */}
                    {isActive && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-[2px]">
                        <div className="w-3 h-[1px] bg-[#FF5E84]" />
                        <div className="w-1 h-1 rounded-full bg-[#FF5E84]" />
                        <div className="w-3 h-[1px] bg-[#FF5E84]" />
                      </div>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Desktop Auth Pills (Hidden on Phone) */}
              <div className="hidden lg:flex items-center gap-3">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    {/* Developer Role: Control Center Button */}
                    {isDev && (
                      <a
                        href="#control-center"
                        onClick={(e) => handleNavClick(e, 'control-center')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-sans-manrope font-bold text-xs px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Shield className="w-3.5 h-3.5 text-white" />
                        <span>Control Center</span>
                      </a>
                    )}

                    {/* Approved Admin Role: Festival Management Button */}
                    {isAdmin && (
                      <a
                        href="#control-center"
                        onClick={(e) => handleNavClick(e, 'control-center')}
                        className="bg-[#111111] hover:bg-black text-white font-sans-manrope font-bold text-xs px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#FF5E84]" />
                        <span>Festival Management</span>
                      </a>
                    )}

                    {/* Normal User: Display Name Badge */}
                    {isNormalUser && (
                      <span className="text-xs font-bold text-[#111111] bg-white border border-black/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <User className="w-3.5 h-3.5 text-[#FF5E84]" />
                        <span>{currentUser.name}</span>
                      </span>
                    )}

                    <button
                      onClick={logout}
                      className="text-xs text-[#5F5F5F] hover:text-[#EF4444] font-bold underline cursor-pointer px-1"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  /* Visitor Desktop Login Button */
                  <button
                    onClick={onOpenLogin}
                    className="bg-white hover:bg-black/5 text-[#111111] font-sans-manrope font-bold text-[13px] px-6 py-2 rounded-full flex items-center gap-2 cursor-pointer shadow-sm border border-[#FF5E84] transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-[#FF5E84]" />
                    <span>Login</span>
                  </button>
                )}
              </div>

              {/* Hamburger Toggle Button (Always visible on Mobile) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#111111] hover:text-[#FF5E84] shadow-sm cursor-pointer transition-colors lg:hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Clean Integrated Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[62px] bg-[#FAF8F5]/98 backdrop-blur-2xl border-b border-black/10 p-6 shadow-2xl animate-in fade-in max-h-[85vh] overflow-y-auto">
            <nav className="flex flex-col gap-2 text-left">
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

              {/* Mobile Account Profile & Dashboard Actions */}
              {currentUser ? (
                <div className="p-4 rounded-2xl bg-white border border-black/10 space-y-3">
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-black/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-sm">
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

                  {/* Mobile Dashboard Quick Action */}
                  {isDev && (
                    <a
                      href="#control-center"
                      onClick={(e) => handleNavClick(e, 'control-center')}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Developer Control Center</span>
                    </a>
                  )}

                  {isAdmin && (
                    <a
                      href="#control-center"
                      onClick={(e) => handleNavClick(e, 'control-center')}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#111111] text-white font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Lock className="w-4 h-4 text-[#FF5E84]" />
                      <span>Festival Management</span>
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
