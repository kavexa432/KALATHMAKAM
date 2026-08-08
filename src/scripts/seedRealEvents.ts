// @ts-nocheck
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { initialEvents, initialStages } from '../shared/data/festivalData';

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

async function seed() {
  console.log('Seeding Official 7-Stage Events and Stages into Firestore...');
  try {
    // 1. Clear old events
    const eventsRef = collection(db, 'events');
    const existingEvents = await getDocs(eventsRef);
    console.log(`Deleting ${existingEvents.size} existing events...`);
    const deleteBatch = writeBatch(db);
    existingEvents.docs.forEach((d) => deleteBatch.delete(d.ref));
    await deleteBatch.commit();
    console.log('Deleted old events.');

    // 2. Clear old stages
    const stagesRef = collection(db, 'stages');
    const existingStages = await getDocs(stagesRef);
    console.log(`Deleting ${existingStages.size} existing stages...`);
    const deleteStagesBatch = writeBatch(db);
    existingStages.docs.forEach((d) => deleteStagesBatch.delete(d.ref));
    await deleteStagesBatch.commit();
    console.log('Deleted old stages.');

    // 3. Insert official initialEvents
    const addEventsBatch = writeBatch(db);
    initialEvents.forEach((evt) => {
      const newRef = doc(eventsRef, evt.id);
      addEventsBatch.set(newRef, evt);
    });
    await addEventsBatch.commit();
    console.log(`Successfully seeded ${initialEvents.length} official events!`);

    // 4. Insert official initialStages
    const addStagesBatch = writeBatch(db);
    initialStages.forEach((stg) => {
      const newRef = doc(stagesRef, stg.id);
      addStagesBatch.set(newRef, stg);
    });
    await addStagesBatch.commit();
    console.log(`Successfully seeded ${initialStages.length} official stages!`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding events:', err);
    process.exit(1);
  }
}

seed();
