import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useFestival();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState<string | null>(null);

  // Press ESC to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    setAccessDeniedMsg(null);
    
    try {
      // On mobile this triggers a redirect (page reloads) — modal closes naturally.
      // On desktop the popup resolves quickly and we close immediately.
      loginWithGoogle().catch((err: any) => {
        if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
          setAccessDeniedMsg('Google Sign-In failed. Please try again in Chrome or Safari.');
          setGoogleLoading(false);
        }
      });

      // Close modal immediately on desktop (redirect handles mobile automatically)
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (!isMobile) {
        onClose();
        setGoogleLoading(false);
      }
      // On mobile: page will reload after redirect, modal disappears naturally
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      setAccessDeniedMsg('Google Sign-In was blocked or cancelled. Please open the site directly in Chrome or Safari.');
      setGoogleLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] rounded-[28px] sm:rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl border border-black/10 relative text-left my-auto cursor-default"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-7 bg-gradient-to-r from-[#111111] to-[#2B2B2B] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 sm:gap-3.5 pr-8">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] p-[2px] shrink-0">
              <div className="w-full h-full bg-[#111111] rounded-2xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#FF5E84]" />
              </div>
            </div>
            <div>
              <h3 className="font-serif-cormorant font-bold text-xl sm:text-2xl text-white leading-tight">
                Teacher & Admin Portal
              </h3>
              <p className="font-sans-manrope text-[11px] sm:text-xs text-white/70 mt-0.5">
                Public visitors do not need to log in. Sign in to access Festival Management tools.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-5">

          {/* Access Denied Warning */}
          {accessDeniedMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans-manrope font-bold">
              {accessDeniedMsg}
            </div>
          )}

          {/* Primary Google Login Button */}
          <button
            onClick={handleGoogleClick}
            disabled={googleLoading}
            className="w-full py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl bg-white hover:bg-black/5 border border-black/15 text-[#111111] font-sans-manrope font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 cursor-pointer shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-[#FF5E84] rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Footer Security Note */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-black/8 text-[#5F5F5F]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[10px] leading-relaxed">
              <span className="font-sans-manrope font-extrabold text-[#111111] block mb-0.5">Secure Authentication</span>
              Festival management is restricted to authorized administrators.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
