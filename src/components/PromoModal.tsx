import React, { useEffect, useRef } from 'react';
import { X, Sparkles, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import promoVideo from '../assets/promo.mp4';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Pause video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl cursor-pointer animate-in fade-in"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel bg-[#FAF8F5] rounded-[32px] max-w-3xl w-full overflow-hidden shadow-2xl relative border border-white/90 cursor-default"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-[#111111]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF5E84] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-cormorant text-2xl font-bold text-[#111111]">
                Kalathmakam 2K26 Official Teaser
              </h3>
              <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                MGM Model School Ayiroor, Varkala
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-[#111111] hover:text-[#FF5E84] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={promoVideo}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
            title="Kalathmakam Promo Video"
          />
        </div>

        {/* Footer info */}
        <div className="p-6 bg-[#FAF8F5] flex items-center justify-between text-xs font-sans-manrope text-[#5F5F5F]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#FF5E84]" />
            <span>Grand Arts Fest 2K26 • Jan 22 - 24, 2026</span>
          </div>
          <button
            onClick={onClose}
            className="gradient-btn-primary text-white font-bold px-6 py-2 rounded-full shadow-md text-xs cursor-pointer"
          >
            Close Teaser
          </button>
        </div>
      </motion.div>
    </div>
  );
};
