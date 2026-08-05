import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Ticket } from 'lucide-react';
import { EVENTS_DATA, type EventItem } from '../data/eventsData';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEvent?: EventItem | null;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  preselectedEvent,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [chestNumber, setChestNumber] = useState('');
  const [formData, setFormData] = useState({
    studentName: '',
    gradeClass: 'Grade X A',
    house: 'Ruby',
    selectedEventId: preselectedEvent ? preselectedEvent.id : EVENTS_DATA[0].id,
    phone: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomChest = `K26-${Math.floor(100 + Math.random() * 900)}`;
    setChestNumber(randomChest);
    setSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  const selectedEventObj = EVENTS_DATA.find((e) => e.id === formData.selectedEventId);

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
        className="glass-panel bg-[#FAF8F5] rounded-[32px] max-w-lg w-full p-8 relative shadow-2xl overflow-hidden border border-white/90 cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full glass-card flex items-center justify-center text-[#111111] hover:text-[#FF5E84] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-serif-cormorant text-3xl font-bold text-[#111111]">
              Registration Confirmed!
            </h3>

            <div className="glass-card p-6 rounded-2xl space-y-2 border border-[#FF5E84]/30 bg-gradient-to-br from-[#FF5E84]/5 to-[#FF8A00]/5">
              <span className="text-xs font-bold text-[#5F5F5F] uppercase tracking-wider">
                Official Chest Number
              </span>
              <div className="font-serif-cormorant text-4xl font-extrabold text-[#FF5E84] tracking-widest">
                {chestNumber}
              </div>
              <p className="text-xs text-[#5F5F5F]">
                Keep this chest number for event entry on festival day.
              </p>
            </div>

            <div className="text-left text-xs font-sans-manrope space-y-1.5 p-4 rounded-xl bg-white border border-black/5">
              <div><strong className="text-[#111111]">Participant:</strong> {formData.studentName}</div>
              <div><strong className="text-[#111111]">Class:</strong> {formData.gradeClass} ({formData.house} House)</div>
              <div><strong className="text-[#111111]">Event:</strong> {selectedEventObj?.title}</div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full gradient-btn-primary text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
            >
              Done & Return to Site
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#FF5E84] text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-serif-cormorant text-2xl font-bold text-[#111111]">
                Student Event Registration
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold focus:outline-none focus:border-[#FF5E84]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Grade / Class
                </label>
                <select
                  value={formData.gradeClass}
                  onChange={(e) => setFormData({ ...formData, gradeClass: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold focus:outline-none focus:border-[#FF5E84]"
                >
                  <option>Grade IX A</option>
                  <option>Grade IX B</option>
                  <option>Grade X A</option>
                  <option>Grade X B</option>
                  <option>Grade XI A</option>
                  <option>Grade XI B</option>
                  <option>Grade XII A</option>
                  <option>Grade XII B</option>
                  <option>Grade XII C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  House
                </label>
                <select
                  value={formData.house}
                  onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold focus:outline-none focus:border-[#FF5E84]"
                >
                  <option value="Ruby">Ruby (Vega)</option>
                  <option value="Emerald">Emerald (Capella)</option>
                  <option value="Sapphire">Sapphire (Spica)</option>
                  <option value="Topaz">Topaz (Rigel)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                Select Competition Event
              </label>
              <select
                value={formData.selectedEventId}
                onChange={(e) => setFormData({ ...formData, selectedEventId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold focus:outline-none focus:border-[#FF5E84]"
              >
                {EVENTS_DATA.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                Parent / Guardian Phone
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold focus:outline-none focus:border-[#FF5E84]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full gradient-btn-primary text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Confirm Registration</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
