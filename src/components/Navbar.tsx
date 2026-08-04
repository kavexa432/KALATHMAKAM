import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegister }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Events', href: '#events', id: 'events' },
    { name: 'Schedule', href: '#schedule', id: 'schedule' },
    { name: 'Gallery', href: '#gallery', id: 'gallery' },
    { name: 'Committee', href: '#committee', id: 'committee' },
    { name: 'Sponsors', href: '#sponsors', id: 'sponsors' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = navLinks.map((link) => link.id);
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-nav py-2.5 shadow-xs' : 'bg-transparent py-3 sm:py-3.5'
      }`}
    >
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand (+10% size) */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF5E84] via-[#FF8A00] to-[#7A3CF5] p-[2px] shadow-xs">
              <div className="w-full h-full bg-[#FAF8F5] rounded-full flex items-center justify-center">
                <Sparkles className="w-5.5 h-5.5 text-[#FF5E84]" />
              </div>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="font-malayalam font-black text-[27px] tracking-tight text-[#111111] leading-none">
                കലാത്മകം
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-[1px] w-3.5 bg-[#FF8A00]" />
                <span className="text-[11px] font-sans-manrope font-extrabold tracking-widest text-[#FF5E84]">
                  2K26
                </span>
                <span className="h-[1px] w-3.5 bg-[#FF8A00]" />
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-9">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`relative font-sans-manrope text-[13px] font-medium tracking-wider uppercase transition-colors duration-300 ${
                    isActive
                      ? 'text-[#FF5E84] font-bold'
                      : 'text-[#5F5F5F] hover:text-[#111111]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[#FF5E84] text-[9px] font-bold">
                      <span>—</span>
                      <span className="w-1.5 h-1.5 bg-[#FF8A00] rounded-full" />
                      <span>—</span>
                    </div>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Buttons: Thinner, cleaner Register button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRegister}
              className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs px-6 py-2 rounded-full flex items-center gap-2 group cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <span>Register Now</span>
              <div className="w-5 h-5 rounded-full bg-white text-[#FF5E84] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="w-3 h-3 stroke-[3]" />
              </div>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#111111] hover:text-[#FF5E84]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] bg-[#FAF8F5]/98 backdrop-blur-xl border-b border-black/10 p-6 shadow-2xl animate-in fade-in">
          <nav className="flex flex-col gap-3 text-left">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold py-2 px-3 rounded-lg transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#FF5E84]/10 text-[#FF5E84]'
                    : 'text-[#333333] hover:bg-black/5'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
