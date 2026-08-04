import React from 'react';
import { COMMITTEE_MEMBERS } from '../data/committeeData';
import { Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export const CommitteeGrid: React.FC = () => {
  return (
    <section id="committee" className="py-24 relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-sans-manrope font-extrabold tracking-[0.25em] text-[#FF5E84] uppercase">
            FESTIVAL ORGANIZERS
          </span>
          <h2 className="font-serif-cormorant text-4xl sm:text-5xl md:text-6xl font-bold text-[#111111]">
            Executive Committee
          </h2>
          <p className="font-sans-manrope text-base sm:text-lg text-[#5F5F5F]">
            The visionary leadership, faculty mentors, and student leaders steering Kalathmakam 2K26.
          </p>
        </div>

        {/* Glass Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMMITTEE_MEMBERS.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card rounded-[28px] p-6 flex flex-col items-center text-center space-y-4 group hover:border-[#FF5E84]/40"
            >
              {/* Avatar image */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#FF5E84] via-[#FF8A00] to-[#7A3CF5] shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Info */}
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-sans-manrope font-bold bg-[#FF5E84]/10 text-[#FF5E84]">
                  {member.role}
                </span>
                <h3 className="font-serif-cormorant text-2xl font-bold text-[#111111]">
                  {member.name}
                </h3>
                <p className="font-sans-manrope text-xs text-[#5F5F5F] font-medium">
                  {member.designation}
                </p>
              </div>

              {/* Contact buttons if available */}
              <div className="pt-2 flex items-center gap-3 text-xs text-[#5F5F5F]">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1.5 hover:text-[#FF5E84] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-1.5 hover:text-[#FF8A00] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
