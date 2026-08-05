import { useState } from 'react';
import { FestivalProvider } from './shared/context/FestivalContext';
import { Navbar } from './frontend/website/components/Navbar';
import { Hero } from './frontend/website/components/Hero';
import { FestivalControlCenter } from './frontend/website/components/FestivalControlCenter';
import { LiveEventsSection } from './frontend/website/components/LiveEventsSection';
import { LeaderboardSection } from './frontend/website/components/LeaderboardSection';
import { ResultsSection } from './frontend/website/components/ResultsSection';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { About } from './components/About';
import { GalleryMasonry } from './components/GalleryMasonry';
import { CommitteeGrid } from './components/CommitteeGrid';
import { SponsorsMarquee } from './components/SponsorsMarquee';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Dashboard } from './frontend/dashboard/Dashboard';
import { LoginModal } from './shared/components/LoginModal';
import { PromoModal } from './components/PromoModal';
import { RegisterModal } from './components/RegisterModal';
import type { EventItem } from './data/eventsData';

export function AppContent() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedRegisterEvent] = useState<EventItem | null>(null);

  const handleExploreEvents = () => {
    const el = document.getElementById('events');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewLeaderboard = () => {
    const el = document.getElementById('leaderboard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] relative font-sans-manrope selection:bg-[#FF5E84] selection:text-white overflow-x-hidden">
      
      {/* Public Navigation Bar */}
      <Navbar onOpenLogin={() => setLoginModalOpen(true)} />

      {/* Main Homepage Flow */}
      <main>
        {/* 1. Refined Hero Section with 30-Point Pixel Alignment & Parallax */}
        <Hero
          onOpenPromo={() => setPromoModalOpen(true)}
          onExploreEvents={handleExploreEvents}
          onViewLeaderboard={handleViewLeaderboard}
        />

        {/* 2. Festival Control Center Widget */}
        <FestivalControlCenter />

        {/* 3. Today's Live Events & Category Filter */}
        <LiveEventsSection />

        {/* 4. House Championship Leaderboard & Score Graph */}
        <LeaderboardSection />

        {/* 5. Latest Verified Results & Individual Achievements */}
        <ResultsSection />

        {/* 6. Program Schedule Timeline */}
        <ScheduleTimeline />

        {/* 7. Editorial About Kalathmakam */}
        <About />

        {/* 8. Categorized Gallery Masonry */}
        <GalleryMasonry />

        {/* 9. Committee Grid */}
        <CommitteeGrid />

        {/* 10. Sponsors Marquee */}
        <SponsorsMarquee />

        {/* 11. Contact & Map Section */}
        <ContactSection />

        {/* 12. Mission Control CMS Dashboard (for Admins & Developers) */}
        <Dashboard />
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Teaser Video Promo Modal */}
      <PromoModal
        isOpen={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
      />

      {/* Registration Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        preselectedEvent={selectedRegisterEvent}
      />

    </div>
  );
}

export function App() {
  return (
    <FestivalProvider>
      <AppContent />
    </FestivalProvider>
  );
}

export default App;
