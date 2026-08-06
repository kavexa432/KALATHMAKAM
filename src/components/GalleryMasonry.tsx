import React, { useState } from 'react';
import { GALLERY_CATEGORIES, GALLERY_DATA, type GalleryItem } from '../data/galleryData';
import { Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GalleryMasonry: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  const filteredItems = GALLERY_DATA.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <section id="gallery" className="py-24 relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-sans-manrope font-extrabold tracking-[0.25em] text-[#FF5E84] uppercase">
            VISUAL SNAPSHOTS
          </span>
          <h2 className="font-serif-cormorant text-4xl sm:text-5xl md:text-6xl font-bold text-[#111111]">
            Festival Gallery
          </h2>
          <p className="font-sans-manrope text-base sm:text-lg text-[#5F5F5F]">
            Moments of passion, grace, and glory captured at Kalathmakam.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-12">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-sans-manrope font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF5E84] to-[#FF8A00] text-white shadow-md scale-105'
                    : 'glass-card text-[#5F5F5F] hover:text-[#111111]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Masonry Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="break-inside-avoid relative rounded-[24px] overflow-hidden glass-card group cursor-pointer"
                onClick={() => setLightboxImage(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-sans-manrope font-bold uppercase tracking-wider text-[#FF5E84] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {item.category}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h4 className="font-serif-cormorant text-xl font-bold">
                    {item.title}
                  </h4>
                  <p className="font-sans-manrope text-xs text-white/80 line-clamp-1 mt-1">
                    {item.caption}
                  </p>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="fixed top-6 right-6 text-white hover:bg-white/10 rounded-full p-2 flex items-center justify-center z-[60] transition-colors"
                aria-label="Close"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="rounded-[24px] overflow-hidden shadow-2xl border border-white/10 max-h-[80vh]">
                <img
                  src={lightboxImage.imageUrl}
                  alt={lightboxImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-center mt-4 text-white space-y-1">
                <span className="text-xs text-[#FF5E84] font-bold uppercase tracking-wider">
                  {lightboxImage.category}
                </span>
                <h3 className="font-serif-cormorant text-2xl font-bold">
                  {lightboxImage.title}
                </h3>
                <p className="text-xs text-white/70 max-w-lg mx-auto">
                  {lightboxImage.caption}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
