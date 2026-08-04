import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle2, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Query',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-sans-manrope font-extrabold tracking-[0.25em] text-[#FF5E84] uppercase">
            GET IN TOUCH
          </span>
          <h2 className="font-serif-cormorant text-4xl sm:text-5xl md:text-6xl font-bold text-[#111111]">
            Contact & Venue Details
          </h2>
          <p className="font-sans-manrope text-base sm:text-lg text-[#5F5F5F]">
            Reach out to our festival helpdesk or visit MGM Model School, Ayiroor, Varkala.
          </p>
        </div>

        {/* Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: School Address & Map */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-card p-8 rounded-[28px] space-y-6">
              <h3 className="font-serif-cormorant text-3xl font-bold text-[#111111]">
                Festival Helpdesk & Campus
              </h3>

              <div className="space-y-5 text-sm font-sans-manrope text-[#5F5F5F]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF5E84]/12 text-[#FF5E84] flex items-center justify-center shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-[#111111] block text-base font-bold">
                      MGM Model School
                    </strong>
                    <span>Ayiroor P.O, Varkala, Thiruvananthapuram, Kerala 695310</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF8A00]/12 text-[#FF8A00] flex items-center justify-center shrink-0 mt-1">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-[#111111] block font-bold">Helpline Numbers</strong>
                    <span>+91 94470 12345 / +91 0470 2695200</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#4DA8FF]/12 text-[#4DA8FF] flex items-center justify-center shrink-0 mt-1">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-[#111111] block font-bold">Email Address</strong>
                    <span>kalathmakam2k26@mgmayiroor.ac.in</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#7A3CF5]/12 text-[#7A3CF5] flex items-center justify-center shrink-0 mt-1">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-[#111111] block font-bold">Helpdesk Timings</strong>
                    <span>8:00 AM - 6:00 PM (Festival Days)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="glass-card rounded-[28px] overflow-hidden p-2 shadow-lg h-64">
              <iframe
                title="MGM Model School Ayiroor Varkala Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15777.654862451996!2d76.7123!3d8.7345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05eb4a5d3f8a91%3A0x8e8749a5b9b1d9c0!2sVarkala%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full rounded-[22px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Contact & Registration Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 sm:p-10 rounded-[32px] shadow-xl border border-white/90 relative">
              
              {formSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif-cormorant text-3xl font-bold text-[#111111]">
                    Message Received!
                  </h3>
                  <p className="font-sans-manrope text-sm text-[#5F5F5F] max-w-md mx-auto">
                    Thank you for contacting Kalathmakam 2K26. Our student committee will respond to your query shortly.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs px-6 py-3 rounded-full shadow-md mt-4 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-serif-cormorant text-3xl font-bold text-[#111111]">
                      Send us an Inquiry
                    </h3>
                    <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                      Have a query about stage rules, chest numbers, or venue directions? Fill out the form below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-sans-manrope font-bold text-[#111111]">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anjali Nair"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-sans-manrope font-bold text-[#111111]">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. anjali@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-sans-manrope font-bold text-[#111111]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-sans-manrope font-bold text-[#111111]">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111]"
                      >
                        <option>General Query</option>
                        <option>Event Registration & Rules</option>
                        <option>Stage Timings</option>
                        <option>Sponsorship Inquiry</option>
                        <option>Media & Press Pass</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans-manrope font-bold text-[#111111]">
                      Your Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Type your query or comments here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl glass-panel text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E84] text-[#111111] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="gradient-btn-primary text-white font-sans-manrope font-bold text-sm px-8 py-3.5 rounded-full flex items-center justify-center gap-3 w-full cursor-pointer shadow-lg"
                  >
                    <span>Submit Inquiry</span>
                    <Send className="w-4 h-4" />
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
