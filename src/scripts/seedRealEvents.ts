// @ts-nocheck
import dotenv from 'dotenv';
import { createRequire } from 'node:module';
import { initialEvents, initialStages, houseEvents } from '../shared/data/festivalData';
import { SCHEDULE_DATA } from '../data/scheduleData';

dotenv.config();

const require = createRequire(`${process.cwd()}\\backend\\seed.cjs`);
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  throw new Error('Missing Firebase Admin credentials. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to .env.');
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kalathmakam-5783c.firebasestorage.app',
  });
}

const db = getFirestore();

const normalize = (value?: string | null) => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const clean = (value: unknown) => JSON.parse(JSON.stringify(value));

const scheduleParticipants = new Map(
  SCHEDULE_DATA
    .filter((event) => event.title !== 'LUNCH BREAK' && typeof event.participants === 'number')
    .map((event) => [
      `${normalize(event.stage)}:${normalize(event.title)}`,
      event.participants,
    ])
);

const allOfficialEvents = [...initialEvents, ...houseEvents].map((event) => {
  const scheduleKey = `${normalize(`${event.stage}: ${event.venue}`)}:${normalize(event.eventName)}`;
  const participants = scheduleParticipants.get(scheduleKey);
  return clean(participants == null ? event : { ...event, participantsExpected: participants });
});

async function clearCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  let batch = db.batch();
  let batchSize = 0;

  for (const document of snapshot.docs) {
    batch.delete(document.ref);
    batchSize += 1;

    if (batchSize === 450) {
      await batch.commit();
      batch = db.batch();
      batchSize = 0;
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  return snapshot.size;
}

async function writeCollection(collectionName: string, records: Array<{ id: string }>) {
  let batch = db.batch();
  let batchSize = 0;

  for (const record of records) {
    batch.set(db.collection(collectionName).doc(record.id), clean(record));
    batchSize += 1;

    if (batchSize === 450) {
      await batch.commit();
      batch = db.batch();
      batchSize = 0;
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }
}

async function seed() {
  console.log('Seeding official event catalogue into Firestore...');

  const deletedEvents = await clearCollection('events');
  const deletedStages = await clearCollection('stages');

  await writeCollection('events', allOfficialEvents);
  await writeCollection('stages', initialStages);

  console.log(`Deleted ${deletedEvents} old events and ${deletedStages} old stages.`);
  console.log(`Seeded ${allOfficialEvents.length} events and ${initialStages.length} stages.`);
}

seed().catch((err) => {
  console.error('Error seeding events:', err);
  process.exit(1);
});
