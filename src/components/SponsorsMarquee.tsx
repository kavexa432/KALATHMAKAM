import React from 'react';
import { Award, Sparkles, Shield, Star } from 'lucide-react';

export const SponsorsMarquee: React.FC = () => {
  const sponsors = [
    { name: 'MGM Group of Institutions', tier: 'Title Partner', icon: Shield },
    { name: 'Kalamandalam Fine Arts Trust', tier: 'Cultural Partner', icon: Star },
    { name: 'Varkala Beach Resorts', tier: 'Hospitality Sponsor', icon: Sparkles },
    { name: 'Malayala Manorama Co.', tier: 'Media Partner', icon: Award },
    { name: 'Mathrubhumi Publications', tier: 'Publishing Partner', icon: Star },
    { name: 'Federal Bank Varkala', tier: 'Banking Partner', icon: Shield },
    { name: 'Kerala Tourism Development', tier: 'Patron Sponsor', icon: Sparkles },
  ];

  // Repeat 3 times to make seamless infinite marquee
  const marqueeItems = [...sponsors, ...sponsors, ...sponsors];

  return (
    <section id="sponsors" className="py-20 relative overflow-hidden bg-gradient-to-r from-[#FFF9F4] via-[#FFF2EA] to-[#FDF6F2] border-y border-[#FF5E84]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <span className="text-xs font-sans-manrope font-extrabold tracking-[0.25em] text-[#FF5E84] uppercase">
          OUR VALUED PARTNERS
        </span>
        <h2 className="font-serif-cormorant text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
          Festival Sponsors & Supporters
        </h2>
      </div>

      {/* Ticker Container */}
      <div className="relative w-full overflow-hidden flex items-center">
        
        {/* Gradient Fades on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FFF9F4] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FDF6F2] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-8 py-4">
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card px-6 py-4 rounded-2xl flex items-center gap-3 shrink-0 hover:scale-105 transition-transform duration-300 shadow-xs border border-white/90"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FF5E84]/10 text-[#FF5E84] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] whitespace-nowrap">
                    {item.name}
                  </h4>
                  <p className="font-sans-manrope text-[11px] text-[#FF8A00] font-semibold">
                    {item.tier}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
