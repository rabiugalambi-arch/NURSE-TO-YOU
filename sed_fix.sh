#!/bin/bash
sed -i "s/import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase\/firestore';/import { collection, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase\/firestore';/" src/components/AdminApp.tsx

sed -i "s/import { ArrowLeft, Users, FileText, CheckCircle, XCircle, Search, Activity, UserCircle, Store } from 'lucide-react';/import { ArrowLeft, Users, FileText, CheckCircle, XCircle, Search, Activity, UserCircle, Store, Stethoscope, Phone, Mail } from 'lucide-react';/" src/components/AdminApp.tsx

sed -i "s/import { collection, query, where, onSnapshot, doc, getDocs, runTransaction } from 'firebase\/firestore';/import { collection, query, where, onSnapshot, doc, getDocs, runTransaction, serverTimestamp } from 'firebase\/firestore';/" src/components/PatientApp.tsx

# Also fix the unsubPhysicianBookings scoping in AdminApp.tsx
sed -i 's/const unsubPhysicianBookings = onSnapshot(collection(db, '\''physician_bookings'\'')/let unsubPhysicianBookings = () => {};\n      unsubPhysicianBookings = onSnapshot(collection(db, '\''physician_bookings'\'')/g' src/components/AdminApp.tsx

