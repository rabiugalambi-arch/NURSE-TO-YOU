import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Provider } from './types';

const mockProviders: Omit<Provider, 'id'>[] = [
  {
    providerId: 'p1',
    name: 'Nurse Amina Yusuf',
    professionalRole: 'RN',
    verified: true,
    available: true,
    latitude: 11.9964, // Kano base
    longitude: 8.5167,
    geohash: 's1qw',
    services: ['Health Check', 'Malaria Test', 'Pregnancy Test', 'Antenatal Care'],
    rating: 4.9,
    estimatedArrival: 15,
    serviceArea: 50000, // Massive radius so testers anywhere can match them
  },
  {
    providerId: 'p2',
    name: 'Nurse Ibrahim Musa',
    professionalRole: 'LPN',
    verified: true,
    available: true,
    latitude: 12.0000,
    longitude: 8.5200,
    geohash: 's1qw',
    services: ['Wound Care', 'Home Nursing', 'Laboratory Sample Collection'],
    rating: 4.8,
    estimatedArrival: 25,
    serviceArea: 50000,
  },
  {
    providerId: 'p3',
    name: 'Nurse Fatima Bello',
    professionalRole: 'NP',
    verified: true,
    available: false, // Testing unavailable
    latitude: 11.9800,
    longitude: 8.5300,
    geohash: 's1qw',
    services: ['Family Planning', 'Health Check', 'Antenatal Care'],
    rating: 5.0,
    estimatedArrival: 30,
    serviceArea: 50000,
  },
  {
    providerId: 'p4',
    name: 'Nurse Chidi Okeke',
    professionalRole: 'RN',
    verified: true,
    available: true,
    latitude: 12.0100, // Kano outskirts
    longitude: 8.5000,
    geohash: 's1qw',
    services: ['Wound Care', 'Malaria Test', 'Laboratory Sample Collection'],
    rating: 4.7,
    estimatedArrival: 45,
    serviceArea: 50000,
  },
];

export async function seedDatabase() {
  const providersRef = collection(db, 'providers');
  const snapshot = await getDocs(providersRef);
  
  if (snapshot.empty) {
    console.log('Seeding demo providers for Nigeria...');
    for (const provider of mockProviders) {
      const docRef = doc(providersRef, provider.providerId);
      await setDoc(docRef, { ...provider, id: provider.providerId });
    }
    console.log('Seeding complete.');
  }
}
