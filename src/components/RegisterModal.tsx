import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-panel bg-[#FAF8F5] rounded-[32px] max-w-lg w-full p-8 relative shadow-2xl overflow-hidden border border-white/90"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full glass-card flex items-center justify-center text-[#111111] hover:text-[#FF5E84] transition-colors"
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
                Assigned Chest Number
              </span>
              <div className="font-serif-cormorant text-4xl font-extrabold text-[#FF5E84]">
                {chestNumber}
              </div>
              <p className="text-xs font-sans-manrope text-[#111111] font-bold">
                {formData.studentName} ({formData.house} House)
              </p>
              <p className="text-xs font-sans-manrope text-[#5F5F5F]">
                Event: {selectedEventObj?.title}
              </p>
            </div>

            <p className="text-xs font-sans-manrope text-[#5F5F5F]">
              Please report to the respective stage coordinator 30 minutes prior to event commencement with your chest number.
            </p>

            <button
              onClick={onClose}
              className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs px-8 py-3 rounded-full shadow-md cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5E84]/10 text-[#FF5E84] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MGM Student Entry</span>
              </div>
              <h3 className="font-serif-cormorant text-3xl font-bold text-[#111111]">
                Register for Competition
              </h3>
              <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                Fill details below to generate your official festival Chest Number.
              </p>
            </div>

            <div className="space-y-4 text-xs font-sans-manrope">
              <div className="space-y-1">
                <label className="font-bold text-[#111111]">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gautham S. Nair"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#111111]">Grade & Section</label>
                  <select
                    value={formData.gradeClass}
                    onChange={(e) => setFormData({ ...formData, gradeClass: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                  >
                    <option>Grade IX A</option>
                    <option>Grade IX B</option>
                    <option>Grade X A</option>
                    <option>Grade X B</option>
                    <option>Grade XI Science</option>
                    <option>Grade XI Commerce</option>
                    <option>Grade XII Science</option>
                    <option>Grade XII Humanities</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#111111]">School House</label>
                  <select
                    value={formData.house}
                    onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                  >
                    <option>Ruby (Red)</option>
                    <option>Emerald (Green)</option>
                    <option>Sapphire (Blue)</option>
                    <option>Topaz (Yellow)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]">Select Competition Event *</label>
                <select
                  value={formData.selectedEventId}
                  onChange={(e) => setFormData({ ...formData, selectedEventId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                >
                  {EVENTS_DATA.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.category}) — {evt.day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]">Parent / Student Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94470 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs px-6 py-3 rounded-full flex items-center justify-center gap-2 w-full shadow-lg cursor-pointer mt-4"
            >
              <Ticket className="w-4 h-4" />
              <span>Confirm & Generate Chest Number</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
