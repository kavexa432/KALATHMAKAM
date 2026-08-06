// @ts-nocheck
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyAfNogJDB5jCENkBHIhth8fnz-87vlKe3I",
  authDomain: "kalathmakam-5783c.firebaseapp.com",
  projectId: "kalathmakam-5783c",
  storageBucket: "kalathmakam-5783c.firebasestorage.app",
  messagingSenderId: "875256530698",
  appId: "1:875256530698:web:8d67776ef5adf851a5dcf3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const eventsList = [
  // Completed - Art
  { name: 'Pencil Drawing', dept: 'Art', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'Painting - Water Colour', dept: 'Art', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'Painting - Crayon', dept: 'Art', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'Painting - Oil Colour', dept: 'Art', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'Cartoon', dept: 'Art', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'Poster Making', dept: 'Art', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'Collage', dept: 'Art', category: 'General', status: 'Completed', stage: null, venue: null },
  
  // Completed - English
  { name: 'English Essay Writing', dept: 'Language', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'English Story Writing', dept: 'Language', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'English Versification (Category 1)', dept: 'Language', category: 'CAT I', status: 'Completed', stage: null, venue: null },
  { name: 'English Versification (Category 2)', dept: 'Language', category: 'CAT II', status: 'Completed', stage: null, venue: null },
  { name: 'English Versification (Category 3)', dept: 'Language', category: 'CAT III', status: 'Completed', stage: null, venue: null },
  { name: 'English Versification (Category 4)', dept: 'Language', category: 'CAT IV', status: 'Completed', stage: null, venue: null },

  // Completed - Malayalam
  { name: 'Malayalam Essay Writing', dept: 'Language', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'Malayalam Story Writing', dept: 'Language', category: 'General', status: 'Completed', stage: null, venue: null },
  { name: 'Malayalam Versification (Category 1)', dept: 'Language', category: 'CAT I', status: 'Completed', stage: null, venue: null },
  { name: 'Malayalam Versification (Category 2)', dept: 'Language', category: 'CAT II', status: 'Completed', stage: null, venue: null },
  { name: 'Malayalam Versification (Category 3)', dept: 'Language', category: 'CAT III', status: 'Completed', stage: null, venue: null },
  { name: 'Malayalam Versification (Category 4)', dept: 'Language', category: 'CAT IV', status: 'Completed', stage: null, venue: null },

  // Completed - Hindi
  { name: 'Hindi Essay Writing (Category 4)', dept: 'Language', category: 'CAT IV', status: 'Completed', stage: null, venue: null },
  { name: 'Hindi Story Writing (Category 4)', dept: 'Language', category: 'CAT IV', status: 'Completed', stage: null, venue: null },
  { name: 'Hindi Versification (Category 4)', dept: 'Language', category: 'CAT IV', status: 'Completed', stage: null, venue: null },

  // Upcoming - Hindi (Not Completed)
  { name: 'Hindi Essay Writing (Category 2)', dept: 'Language', category: 'CAT II', status: 'Upcoming', stage: null, venue: null },
  { name: 'Hindi Essay Writing (Category 3)', dept: 'Language', category: 'CAT III', status: 'Upcoming', stage: null, venue: null },
  { name: 'Hindi Story Writing (Category 2)', dept: 'Language', category: 'CAT II', status: 'Upcoming', stage: null, venue: null },
  { name: 'Hindi Story Writing (Category 3)', dept: 'Language', category: 'CAT III', status: 'Upcoming', stage: null, venue: null },
  { name: 'Hindi Versification (Category 2)', dept: 'Language', category: 'CAT II', status: 'Upcoming', stage: null, venue: null },
  { name: 'Hindi Versification (Category 3)', dept: 'Language', category: 'CAT III', status: 'Upcoming', stage: null, venue: null },

  // Stage 1
  { name: 'Bharathanatyam', dept: 'Dance', category: 'General', status: 'Upcoming', stage: 'stage-1', venue: 'Main Auditorium' },
  { name: 'Kuchipudi', dept: 'Dance', category: 'General', status: 'Upcoming', stage: 'stage-1', venue: 'Main Auditorium' },
  { name: 'Mohiniyattam', dept: 'Dance', category: 'General', status: 'Upcoming', stage: 'stage-1', venue: 'Main Auditorium' },
  { name: 'Folk Dance', dept: 'Dance', category: 'General', status: 'Upcoming', stage: 'stage-1', venue: 'Main Auditorium' },

  // Stage 2
  { name: 'English Recitation', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-2', venue: 'Mini Auditorium' },
  { name: 'English Elocution', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-2', venue: 'Mini Auditorium' },
  { name: 'English Extempore', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-2', venue: 'Mini Auditorium' },
  { name: 'Anchoring', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-2', venue: 'Mini Auditorium' },
  { name: 'Turn Coat', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-2', venue: 'Mini Auditorium' },
  { name: 'Declamation', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-2', venue: 'Mini Auditorium' },
  { name: 'Western Music', dept: 'Music', category: 'General', status: 'Upcoming', stage: 'stage-2', venue: 'Mini Auditorium' },

  // Stage 3
  { name: 'Light Music', dept: 'Music', category: 'General', status: 'Upcoming', stage: 'stage-3', venue: 'KG Auditorium' },
  { name: 'Classical Music', dept: 'Music', category: 'General', status: 'Upcoming', stage: 'stage-3', venue: 'KG Auditorium' },
  { name: 'Group Song', dept: 'Music', category: 'General', status: 'Upcoming', stage: 'stage-3', venue: 'KG Auditorium' },
  { name: 'Patriotic Song', dept: 'Music', category: 'General', status: 'Upcoming', stage: 'stage-3', venue: 'KG Auditorium' },
  { name: 'National Anthem', dept: 'Music', category: 'General', status: 'Upcoming', stage: 'stage-3', venue: 'KG Auditorium' },

  // Stage 4
  { name: 'Malayalam Recitation', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-4', venue: 'Class VI A' },
  { name: 'Malayalam Extempore', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-4', venue: 'Class VI A' },
  { name: 'Sanskrit Recitation', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-4', venue: 'Class VI A' },

  // Stage 5
  { name: 'Hindi Extempore', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-5', venue: 'Class VI B' },
  { name: 'Hindi Elocution', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-5', venue: 'Class VI B' },
  { name: 'Hindi Recitation', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-5', venue: 'Class VI B' },

  // Stage 6
  { name: 'Mappilappattu', dept: 'Music', category: 'General', status: 'Upcoming', stage: 'stage-6', venue: 'Kids Auditorium' },
  { name: 'Arabic Recitation', dept: 'Language', category: 'General', status: 'Upcoming', stage: 'stage-6', venue: 'Kids Auditorium' },
  { name: 'Mono Act', dept: 'Arts', category: 'General', status: 'Upcoming', stage: 'stage-6', venue: 'Kids Auditorium' },
  { name: 'Mimicry', dept: 'Arts', category: 'General', status: 'Upcoming', stage: 'stage-6', venue: 'Kids Auditorium' },
];

async function seed() {
  console.log('Seeding Real Events...');
  try {
    const eventsRef = collection(db, 'events');
    const existing = await getDocs(eventsRef);
    
    console.log(`Deleting ${existing.size} existing events...`);
    const deleteBatch = writeBatch(db);
    existing.docs.forEach((d) => deleteBatch.delete(d.ref));
    await deleteBatch.commit();
    console.log('Deleted old events.');

    const addBatch = writeBatch(db);
    let idCounter = 1;

    eventsList.forEach((e) => {
      const docId = `evt-real-${idCounter.toString().padStart(3, '0')}`;
      const newRef = doc(eventsRef, docId);
      
      const evtData = {
        id: docId,
        eventName: e.name,
        category: e.category,
        type: 'Individual',
        language: e.dept === 'Language' ? e.name.split(' ')[0] : 'Malayalam', // rough guess
        department: e.dept,
        stage: e.stage,
        venue: e.venue,
        date: '2026-08-10',
        
        scheduledStartTime: '09:00', // Assigning a default time
        durationMinutes: 45,
        delayMinutes: 0,
        actualStartTime: null,
        actualEndTime: null,
        
        cancelled: false,
        postponed: false,

        // Required explicitly by new schema
        status: e.status,
        publishToWebsite: true,
        resultsPublished: false,
        winnerUploaded: false,
        housePointsUpdated: false,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      addBatch.set(newRef, evtData);
      idCounter++;
    });

    await addBatch.commit();
    console.log(`Successfully seeded ${eventsList.length} events!`);
    
    // Also delete any stages in firestore to let local stages sync or write them
    const stagesRef = collection(db, 'stages');
    const exStages = await getDocs(stagesRef);
    const stBatch = writeBatch(db);
    exStages.docs.forEach(d => stBatch.delete(d.ref));
    await stBatch.commit();
    console.log('Deleted remote stages, system will recreate them from initialStages.');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding events:', err);
    process.exit(1);
  }
}

seed();
