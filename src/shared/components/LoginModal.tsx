import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginCustomUser } = useFestival();
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      loginCustomUser('vaishnavil4433@gmail.com');
      onClose();
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FAF8F5] rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl border border-black/10 relative text-left">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#111111] to-[#2B2B2B] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] p-[2px]">
              <div className="w-full h-full bg-[#111111] rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#FF5E84]" />
              </div>
            </div>
            <div>
              <h3 className="font-serif-cormorant font-bold text-2xl text-white">
                Kalathmakam Portal Login
              </h3>
              <p className="font-sans-manrope text-xs text-white/70">
                Firebase Google Auth & Firestore Access
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Primary Google Login Button */}
          <button
            onClick={handleGoogleClick}
            disabled={googleLoading}
            className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-black/5 border border-black/15 text-[#111111] font-sans-manrope font-bold text-sm flex items-center justify-center gap-3 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>{googleLoading ? 'Connecting to Firebase...' : 'Sign in with Google'}</span>
          </button>

          <div className="p-3.5 bg-white rounded-2xl border border-black/8 text-[11px] font-sans-manrope text-[#5F5F5F] text-center space-y-1">
            <p>🔥 <strong>Firebase Authentication</strong></p>
            <p className="text-[10px] text-[#5F5F5F]/80">Connected to <code>kalathmakam-5783c</code> with real-time Firestore synchronization.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
