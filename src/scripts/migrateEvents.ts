import { db } from '../config/firebase';
import { collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';

async function migrateEvents() {
  console.log('Starting Firebase Events Migration to Computed Architecture...');
  const eventsRef = collection(db, 'events');
  const snapshot = await getDocs(eventsRef);

  console.log(`Found ${snapshot.size} events to migrate.`);

  let migratedCount = 0;

  for (const eventDoc of snapshot.docs) {
    const data = eventDoc.data();
    
    // Check if already migrated
    if (data.scheduledStartTime !== undefined) {
      console.log(`Event ${data.id} already migrated, skipping.`);
      continue;
    }

    const timeString = data.time || '09:00 AM - 09:40 AM';
    let startTime = '09:00';
    let durationMinutes = 40;

    try {
      const parts = timeString.split('-');
      if (parts.length === 2) {
        const startRaw = parts[0].trim();
        const endRaw = parts[1].trim();

        const parseTime = (tStr: string) => {
          const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (match) {
            let h = parseInt(match[1]);
            const m = parseInt(match[2]);
            const ampm = match[3]?.toUpperCase();
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return { h, m };
          }
          return { h: 9, m: 0 };
        };

        const s = parseTime(startRaw);
        const e = parseTime(endRaw);

        startTime = `${s.h.toString().padStart(2, '0')}:${s.m.toString().padStart(2, '0')}`;
        
        let startMinutes = s.h * 60 + s.m;
        let endMinutes = e.h * 60 + e.m;
        if (endMinutes < startMinutes) endMinutes += 24 * 60;

        durationMinutes = endMinutes - startMinutes;
        if (durationMinutes <= 0 || durationMinutes > 600) durationMinutes = 40;
      }
    } catch (err) {
      console.warn(`Could not parse time "${timeString}" for event ${data.id}, using default.`);
    }

    const updatedData = {
      scheduledStartTime: startTime,
      durationMinutes: durationMinutes,
      delayMinutes: 0,
      actualStartTime: null,
      actualEndTime: null,
      cancelled: false,
      postponed: false,
      resultPublished: false,
      participantsExpected: data.participants || 0,
      
      time: deleteField(),
      status: deleteField(),
      running: deleteField(),
      completed: deleteField(),
      winnerUploaded: deleteField(),
      resultsPublished: deleteField(),
      housePointsAwarded: deleteField()
    };

    try {
      await updateDoc(doc(db, 'events', eventDoc.id), updatedData);
      migratedCount++;
      console.log(`Migrated event: ${data.id} -> Start: ${startTime}, Dur: ${durationMinutes}m`);
    } catch (e) {
      console.error(`Failed to migrate event ${data.id}:`, e);
    }
  }

  console.log(`Migration complete! Successfully migrated ${migratedCount}/${snapshot.size} events.`);
}

migrateEvents().then(() => {
  // process.exit(0);
}).catch((error) => {
  console.error("Migration failed:", error);
  // process.exit(1);
});
