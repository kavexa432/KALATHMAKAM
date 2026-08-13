import { useEffect } from 'react';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Get visitor IP from a free IP API
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();
        
        // Get basic browser info
        const browserInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
        };

        // Track in Firebase
        const visitorRef = doc(db, 'visitors', ip);
        await setDoc(visitorRef, {
          ip,
          lastVisit: serverTimestamp(),
          visitCount: increment(1),
          browserInfo,
        }, { merge: true });

        // Also track total visitor count
        const statsRef = doc(db, 'analytics', 'stats');
        await setDoc(statsRef, {
          totalVisits: increment(1),
          lastUpdated: serverTimestamp(),
        }, { merge: true });

      } catch (error) {
        console.error('Failed to track visitor:', error);
      }
    };

    trackVisitor();
  }, []);
};
