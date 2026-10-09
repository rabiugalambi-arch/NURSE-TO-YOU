import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { collection, query, where, onSnapshot, doc, getDocs, getDoc, runTransaction, serverTimestamp, addDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  MapPin, Navigation, CheckCircle, Search, Clock, Star, Map as MapIcon, 
  ChevronRight, ArrowLeft, HeartPulse, Activity, Baby, Stethoscope, 
  Syringe, FlaskConical, Home, UserCircle, FileText, ActivitySquare,
  Eye, LocateFixed, Calendar, ShieldCheck, Download, Bell, MoreVertical, Store,
  AlertTriangle, Phone, AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db, auth } from '../firebase';
import { Provider, Booking } from '../types';
import { AuthSettings } from './AuthSettings';
import { Lock } from 'lucide-react';
import { PharmacyClientApp } from './pharmacy/PharmacyClientApp';
import { MenstrualTracker } from './MenstrualTracker';
import { triggerNotification } from '../lib/notifications';
import { calculateDistance, cn } from '../lib/utils';
import { KANO_METROPOLITAN_AREAS, OTHER_KANO_LGAS, ALL_KANO_AREAS, DEFAULT_KANO_CENTER } from '../lib/kanoLocations';

// Fix for default marker icons in react-leaflet
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

type Step = 'splash' | 'login' | 'category_services' | 'home' | 'all_services' | 'service_details' | 'location' | 'matching' | 'results' | 'provider_profile' | 'booking_summary' | 'payment' | 'success' | 'profile' | 'reports' | 'auth_settings' | 'pharmacy' | 'bookings' | 'physician_categories' | 'physician_list' | 'physician_profile' | 'physician_booking_form' | 'physician_payment' | 'physician_success' | 'menstrual_tracker';

// Services will be fetched from Firestore dynamically

const PHYSICIAN_SPECIALTIES = [
  { id: 1, name: 'General Physician', icon: UserCircle },
  { id: 2, name: 'Pediatrician', icon: Baby },
  { id: 3, name: 'Obstetrician & Gynecologist', icon: HeartPulse },
  { id: 4, name: 'Cardiologist', icon: Activity },
  { id: 5, name: 'Dermatologist', icon: FileText },
  { id: 6, name: 'Psychiatrist', icon: ShieldCheck },
  { id: 7, name: 'Neurologist', icon: ActivitySquare },
  { id: 8, name: 'Orthopedic Specialist', icon: ShieldCheck },
  { id: 9, name: 'Internal Medicine', icon: FlaskConical },
  { id: 10, name: 'Surgeon', icon: Syringe }
];



const CATEGORY_ICONS: Record<string, string> = {
  'MEDICATION': '💉',
  'WOUND CARE': '🩹',
  'RESPIRATORY CARE': '🫁',
  'HEALTH MONITORING': '❤️',
  'URINARY CARE': '🚻',
  'GASTRO CARE': '🩺',
  'PHYSICAL CARE': '🧑‍🦽',
  'DIAGNOSTIC CARE': '🔬',
  'OTHER LABORATORY SERVICES': '🧪',
  'PREGNANCY CARE': '🤰',
  'FAMILY PLANNING SERVICES': '👨‍👩‍👧',
  'GENERAL HEALTH EDUCATION': '📚',
  'ORAL HEALTH': '🦷',
  'EYE CARE': '👁️',
  'EAR, NOSE AND THROAT (ENT) CARE': '👂',
  'SKIN CARE': '🧴',
  'ORTHOPEDIC CARE': '🦴',
  'MENTAL HEALTH': '🧠',
  'PEDIATRIC / KIDS HEALTH': '👶',
  'AMBULANCE SERVICE': '🚑',
};


const FALLBACK_SERVICES_LIST = [{"id":"fs_1","categoryId":"MEDICATION","name":"Injection","price":5000,"roles":["RN","LPN"],"description":"Professional Injection","active":true},{"id":"fs_2","categoryId":"MEDICATION","name":"Intravenous Therapy","price":5000,"roles":["RN","LPN"],"description":"Professional Intravenous Therapy","active":true},{"id":"fs_3","categoryId":"MEDICATION","name":"Transdermal","price":5000,"roles":["RN","LPN"],"description":"Professional Transdermal","active":true},{"id":"fs_4","categoryId":"MEDICATION","name":"Patches","price":5000,"roles":["RN","LPN"],"description":"Professional Patches","active":true},{"id":"fs_5","categoryId":"MEDICATION","name":"Adverse Effects Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Adverse Effects Monitoring","active":true},{"id":"fs_6","categoryId":"WOUND CARE","name":"Dressing Procedures","price":5000,"roles":["RN","LPN"],"description":"Professional Dressing Procedures","active":true},{"id":"fs_7","categoryId":"WOUND CARE","name":"Suture and Staple Removal","price":5000,"roles":["RN","LPN"],"description":"Professional Suture and Staple Removal","active":true},{"id":"fs_8","categoryId":"WOUND CARE","name":"Second Closure","price":5000,"roles":["RN","LPN"],"description":"Professional Second Closure","active":true},{"id":"fs_9","categoryId":"WOUND CARE","name":"Negative Pressure Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Negative Pressure Monitoring","active":true},{"id":"fs_10","categoryId":"WOUND CARE","name":"Bed Sore Care","price":5000,"roles":["RN","LPN"],"description":"Professional Bed Sore Care","active":true},{"id":"fs_11","categoryId":"RESPIRATORY CARE","name":"Nebulizer Treatment","price":5000,"roles":["RN","LPN"],"description":"Professional Nebulizer Treatment","active":true},{"id":"fs_12","categoryId":"RESPIRATORY CARE","name":"Asthmatic Care","price":5000,"roles":["RN","LPN"],"description":"Professional Asthmatic Care","active":true},{"id":"fs_13","categoryId":"RESPIRATORY CARE","name":"Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Monitoring","active":true},{"id":"fs_14","categoryId":"RESPIRATORY CARE","name":"Oxygen Therapy","price":5000,"roles":["RN","LPN"],"description":"Professional Oxygen Therapy","active":true},{"id":"fs_15","categoryId":"HEALTH MONITORING","name":"Vital Signs Tracking","price":5000,"roles":["RN","LPN"],"description":"Professional Vital Signs Tracking","active":true},{"id":"fs_16","categoryId":"HEALTH MONITORING","name":"Blood Glucose Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Blood Glucose Monitoring","active":true},{"id":"fs_17","categoryId":"HEALTH MONITORING","name":"Weight Scaling","price":5000,"roles":["RN","LPN"],"description":"Professional Weight Scaling","active":true},{"id":"fs_18","categoryId":"HEALTH MONITORING","name":"Exercise","price":5000,"roles":["RN","LPN"],"description":"Professional Exercise","active":true},{"id":"fs_19","categoryId":"HEALTH MONITORING","name":"Diet","price":5000,"roles":["RN","LPN"],"description":"Professional Diet","active":true},{"id":"fs_20","categoryId":"URINARY CARE","name":"Catheterization and Catheter Care","price":5000,"roles":["RN","LPN"],"description":"Professional Catheterization and Catheter Care","active":true},{"id":"fs_21","categoryId":"URINARY CARE","name":"Irrigation","price":5000,"roles":["RN","LPN"],"description":"Professional Irrigation","active":true},{"id":"fs_22","categoryId":"URINARY CARE","name":"Urine Testing","price":5000,"roles":["RN","LPN"],"description":"Professional Urine Testing","active":true},{"id":"fs_23","categoryId":"GASTRO CARE","name":"Ostomy and Stoma Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ostomy and Stoma Care","active":true},{"id":"fs_24","categoryId":"GASTRO CARE","name":"Colostomy Bag","price":5000,"roles":["RN","LPN"],"description":"Professional Colostomy Bag","active":true},{"id":"fs_25","categoryId":"GASTRO CARE","name":"Abdominal Skin Care","price":5000,"roles":["RN","LPN"],"description":"Professional Abdominal Skin Care","active":true},{"id":"fs_26","categoryId":"GASTRO CARE","name":"Tube Feeding","price":5000,"roles":["RN","LPN"],"description":"Professional Tube Feeding","active":true},{"id":"fs_27","categoryId":"GASTRO CARE","name":"NG Tube Insertion and Care","price":5000,"roles":["RN","LPN"],"description":"Professional NG Tube Insertion and Care","active":true},{"id":"fs_28","categoryId":"GASTRO CARE","name":"Enema","price":5000,"roles":["RN","LPN"],"description":"Professional Enema","active":true},{"id":"fs_29","categoryId":"PHYSICAL CARE","name":"Mobilization","price":5000,"roles":["RN","LPN"],"description":"Professional Mobilization","active":true},{"id":"fs_30","categoryId":"PHYSICAL CARE","name":"Ambulatory Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ambulatory Care","active":true},{"id":"fs_31","categoryId":"PHYSICAL CARE","name":"Skeletal Traction Care","price":5000,"roles":["RN","LPN"],"description":"Professional Skeletal Traction Care","active":true},{"id":"fs_32","categoryId":"PHYSICAL CARE","name":"Cast and Splint Care","price":5000,"roles":["RN","LPN"],"description":"Professional Cast and Splint Care","active":true},{"id":"fs_33","categoryId":"PHYSICAL CARE","name":"Healthy Exercises","price":5000,"roles":["RN","LPN"],"description":"Professional Healthy Exercises","active":true},{"id":"fs_34","categoryId":"DIAGNOSTIC CARE","name":"Specimen Collection","price":5000,"roles":["RN","LPN"],"description":"Professional Specimen Collection","active":true},{"id":"fs_35","categoryId":"DIAGNOSTIC CARE","name":"Urinalysis","price":5000,"roles":["RN","LPN"],"description":"Professional Urinalysis","active":true},{"id":"fs_36","categoryId":"DIAGNOSTIC CARE","name":"Pregnancy Test","price":5000,"roles":["RN","LPN"],"description":"Professional Pregnancy Test","active":true},{"id":"fs_37","categoryId":"DIAGNOSTIC CARE","name":"Malaria Testing","price":5000,"roles":["RN","LPN"],"description":"Professional Malaria Testing","active":true},{"id":"fs_38","categoryId":"DIAGNOSTIC CARE","name":"Instant Ultrasound","price":5000,"roles":["RN","LPN"],"description":"Professional Instant Ultrasound","active":true},{"id":"fs_39","categoryId":"DIAGNOSTIC CARE","name":"Instant X-Ray","price":5000,"roles":["RN","LPN"],"description":"Professional Instant X-Ray","active":true},{"id":"fs_40","categoryId":"DIAGNOSTIC CARE","name":"All RDTs","price":5000,"roles":["RN","LPN"],"description":"Professional All RDTs","active":true},{"id":"fs_41","categoryId":"OTHER LABORATORY SERVICES","name":"Fasting Blood Sugar","price":5000,"roles":["RN","LPN"],"description":"Professional Fasting Blood Sugar","active":true},{"id":"fs_42","categoryId":"OTHER LABORATORY SERVICES","name":"Random Blood Sugar","price":5000,"roles":["RN","LPN"],"description":"Professional Random Blood Sugar","active":true},{"id":"fs_43","categoryId":"OTHER LABORATORY SERVICES","name":"H. Pylori","price":5000,"roles":["RN","LPN"],"description":"Professional H. Pylori","active":true},{"id":"fs_44","categoryId":"OTHER LABORATORY SERVICES","name":"Retroviral Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Retroviral Screening","active":true},{"id":"fs_45","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis A Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis A Screening","active":true},{"id":"fs_46","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis B Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis B Screening","active":true},{"id":"fs_47","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis C Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis C Screening","active":true},{"id":"fs_48","categoryId":"OTHER LABORATORY SERVICES","name":"Gonorrhea Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Gonorrhea Screening","active":true},{"id":"fs_49","categoryId":"OTHER LABORATORY SERVICES","name":"Syphilis Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Syphilis Screening","active":true},{"id":"fs_50","categoryId":"OTHER LABORATORY SERVICES","name":"Full Blood Count","price":5000,"roles":["RN","LPN"],"description":"Professional Full Blood Count","active":true},{"id":"fs_51","categoryId":"OTHER LABORATORY SERVICES","name":"Blood Grouping and RH","price":5000,"roles":["RN","LPN"],"description":"Professional Blood Grouping and RH","active":true},{"id":"fs_52","categoryId":"OTHER LABORATORY SERVICES","name":"Electrolyte, Urea and Creatinine","price":5000,"roles":["RN","LPN"],"description":"Professional Electrolyte, Urea and Creatinine","active":true},{"id":"fs_53","categoryId":"OTHER LABORATORY SERVICES","name":"Kidney Function Test","price":5000,"roles":["RN","LPN"],"description":"Professional Kidney Function Test","active":true},{"id":"fs_54","categoryId":"OTHER LABORATORY SERVICES","name":"Liver Function Test","price":5000,"roles":["RN","LPN"],"description":"Professional Liver Function Test","active":true},{"id":"fs_55","categoryId":"OTHER LABORATORY SERVICES","name":"Sputum Collection","price":5000,"roles":["RN","LPN"],"description":"Professional Sputum Collection","active":true},{"id":"fs_56","categoryId":"PREGNANCY CARE","name":"Pregnancy Test","price":5000,"roles":["RN","LPN"],"description":"Professional Pregnancy Test","active":true},{"id":"fs_57","categoryId":"PREGNANCY CARE","name":"Antenatal Care","price":5000,"roles":["RN","LPN"],"description":"Professional Antenatal Care","active":true},{"id":"fs_58","categoryId":"PREGNANCY CARE","name":"Delivery Care","price":5000,"roles":["RN","LPN"],"description":"Professional Delivery Care","active":true},{"id":"fs_59","categoryId":"PREGNANCY CARE","name":"Elective CS","price":5000,"roles":["RN","LPN"],"description":"Professional Elective CS","active":true},{"id":"fs_60","categoryId":"PREGNANCY CARE","name":"Emergency CS","price":5000,"roles":["RN","LPN"],"description":"Professional Emergency CS","active":true},{"id":"fs_61","categoryId":"PREGNANCY CARE","name":"CS Wound Care","price":5000,"roles":["RN","LPN"],"description":"Professional CS Wound Care","active":true},{"id":"fs_62","categoryId":"FAMILY PLANNING SERVICES","name":"Health Education and Decision Making Practice","price":5000,"roles":["RN","LPN"],"description":"Professional Health Education and Decision Making Practice","active":true},{"id":"fs_63","categoryId":"FAMILY PLANNING SERVICES","name":"Oral Pills","price":5000,"roles":["RN","LPN"],"description":"Professional Oral Pills","active":true},{"id":"fs_64","categoryId":"FAMILY PLANNING SERVICES","name":"Injectable Methods","price":5000,"roles":["RN","LPN"],"description":"Professional Injectable Methods","active":true},{"id":"fs_65","categoryId":"FAMILY PLANNING SERVICES","name":"Intrauterine Device","price":5000,"roles":["RN","LPN"],"description":"Professional Intrauterine Device","active":true},{"id":"fs_66","categoryId":"FAMILY PLANNING SERVICES","name":"Implant","price":5000,"roles":["RN","LPN"],"description":"Professional Implant","active":true},{"id":"fs_67","categoryId":"FAMILY PLANNING SERVICES","name":"Patch","price":5000,"roles":["RN","LPN"],"description":"Professional Patch","active":true},{"id":"fs_68","categoryId":"FAMILY PLANNING SERVICES","name":"Barrier Methods","price":5000,"roles":["RN","LPN"],"description":"Professional Barrier Methods","active":true},{"id":"fs_69","categoryId":"FAMILY PLANNING SERVICES","name":"Implant Removal","price":5000,"roles":["RN","LPN"],"description":"Professional Implant Removal","active":true},{"id":"fs_70","categoryId":"FAMILY PLANNING SERVICES","name":"Other Family Planning Care","price":5000,"roles":["RN","LPN"],"description":"Professional Other Family Planning Care","active":true},{"id":"fs_71","categoryId":"GENERAL HEALTH EDUCATION","name":"General Health Education","price":5000,"roles":["RN","LPN"],"description":"Professional General Health Education","active":true},{"id":"fs_72","categoryId":"ORAL HEALTH","name":"Oral Health","price":5000,"roles":["RN","LPN"],"description":"Professional Oral Health","active":true},{"id":"fs_73","categoryId":"EYE CARE","name":"Eye Care","price":5000,"roles":["RN","LPN"],"description":"Professional Eye Care","active":true},{"id":"fs_74","categoryId":"EAR, NOSE AND THROAT (ENT) CARE","name":"Ear, Nose and Throat (ENT) Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ear, Nose and Throat (ENT) Care","active":true},{"id":"fs_75","categoryId":"SKIN CARE","name":"Skin Care","price":5000,"roles":["RN","LPN"],"description":"Professional Skin Care","active":true},{"id":"fs_76","categoryId":"ORTHOPEDIC CARE","name":"Orthopedic Care","price":5000,"roles":["RN","LPN"],"description":"Professional Orthopedic Care","active":true},{"id":"fs_77","categoryId":"MENTAL HEALTH","name":"Mental Health Support","price":5000,"roles":["RN","LPN"],"description":"Professional Mental Health Support","active":true},{"id":"fs_78","categoryId":"PEDIATRIC - KIDS HEALTH","name":"Pediatric / Kids Health","price":5000,"roles":["RN","LPN"],"description":"Professional Pediatric / Kids Health","active":true},{"id":"fs_79","categoryId":"AMBULANCE SERVICE","name":"Request Ambulance","price":5000,"roles":["RN","LPN"],"description":"Professional Request Ambulance","active":true}];

const SERVICE_SEARCH_KEYWORDS: Record<string, string[]> = {
  'Malaria Testing': ['malaria', 'zazzabin cizon sauro', 'zazzabi', 'typhoid'],
  'Injection': ['injection', 'allura', 'allurar magani'],
  'Intravenous Therapy': ['intravenous', 'iv', 'drip', 'ruwa', 'karin ruwa'],
  'Vital Signs Tracking': ['vital signs', 'bp', 'blood pressure', 'hauwan jini', 'jinni', 'zazzabi', 'zazzabin jiki', 'heart rate'],
  'Blood Glucose Monitoring': ['blood glucose', 'sugar', 'sukari', 'ciwon sukari', 'diabetes'],
  'Pregnancy Test': ['pregnancy', 'ciki', 'juna biyu', 'gwajin ciki'],
  'Antenatal Care': ['antenatal', 'awu', 'juna biyu'],
  'Delivery Care': ['delivery', 'haihuwa'],
  'Dressing Procedures': ['dressing', 'wanke ciwo', 'ciwo', 'rauni', 'kula da ciwo', 'jinni'],
  'Suture and Staple Removal': ['suture', 'zare', 'cire zare', 'dinki'],
  'Oxygen Therapy': ['oxygen', 'iska', 'numfashi'],
  'Nebulizer Treatment': ['nebulizer', 'asima', 'numfashi', 'asthma'],
  'Asthmatic Care': ['asthma', 'asima', 'numfashi'],
  'Catheterization and Catheter Care': ['catheter', 'fitsari', 'robar fitsari'],
  'Urine Testing': ['urine', 'fitsari', 'gwajin fitsari'],
  'Urinalysis': ['urinalysis', 'fitsari', 'gwajin fitsari'],
  'Mobilization': ['mobilization', 'motsa jiki'],
  'Full Blood Count': ['fbc', 'jini', 'gwajin jini'],
  'Instant Ultrasound': ['ultrasound', 'scan', 'hoton ciki'],
  'Instant X-Ray': ['x-ray', 'xray', 'hoto', 'hoton kashi']
};

export function isProviderApproved(p: any): boolean {
  if (!p) return false;
  if (p.applicationStatus === 'rejected' || p.applicationStatus === 'suspended' || p.status === 'suspended' || p.status === 'rejected') {
    return false;
  }
  return Boolean(
    p.verified === true || 
    p.verified === 'true' || 
    p.applicationStatus === 'approved' || 
    p.isApproved === true || 
    p.isApproved === 'true' || 
    p.approved === true || 
    p.approved === 'true' || 
    p.status === 'approved'
  );
}

export function isProviderAvailable(p: any): boolean {
  if (!p) return false;
  if (p.available === false && !p.isAvailable && p.dutyStatus !== 'ON' && !p.online && p.status !== 'available') {
    return false;
  }
  return Boolean(
    p.available === true || 
    p.available === 'true' || 
    p.isAvailable === true || 
    p.isAvailable === 'true' || 
    p.dutyStatus === 'ON' || 
    p.dutyStatus === 'on' || 
    p.online === true || 
    p.online === 'true' || 
    p.status === 'available'
  );
}

export function isProviderServiceMatch(p: any, service: any): boolean {
  if (!service) return true;
  const sName = (service.name || '').toLowerCase().trim();
  const sCat = (service.categoryId || '').toLowerCase().trim();
  
  if (p.type === 'physician' || sName.includes('physician')) {
    if (p.type === 'physician') {
      if (!p.specialty || !service.specialty) return true;
      return p.specialty.toLowerCase().trim() === service.specialty.toLowerCase().trim();
    }
    return false;
  }

  const pRole = (p.professionalRole || p.role || p.qualification || '').toLowerCase().trim();
  const isNurseRole = !p.type || p.type !== 'physician' || pRole.includes('rn') || pRole.includes('nurse') || pRole.includes('lpn') || pRole.includes('chew') || pRole.includes('midwife') || pRole.includes('health') || pRole.includes('matron') || pRole.includes('officer');

  let rawList: string[] = [];
  if (Array.isArray(p.services)) {
    rawList = p.services;
  } else if (typeof p.services === 'string' && p.services.trim().length > 0) {
    rawList = p.services.split(/[,;\n]/);
  }
  const pServices: string[] = rawList
    .map((s: any) => String(s || '').trim())
    .filter(s => s.length > 0);

  // If provider has no specific limitation or covers all/nursing, allow standard nursing services
  if (pServices.length === 0) return true;

  const hasBroadCoverage = pServices.some(s => {
    const sl = s.toLowerCase();
    return sl === 'all' || 
           sl === 'all services' || 
           sl.includes('general nursing') || 
           sl.includes('nursing care') || 
           sl.includes('home care') || 
           sl.includes('community health') || 
           sl === 'nursing' || 
           sl.includes('clinical') || 
           sl.includes('registered nurse') ||
           sl.includes('general practice');
  });
  if (hasBroadCoverage && isNurseRole) return true;

  const keywords = SERVICE_SEARCH_KEYWORDS[service.name] || [];

  return pServices.some(s => {
    const sl = s.toLowerCase();
    if (!sl) return false;
    if (sl === sName || sName.includes(sl) || sl.includes(sName)) return true;
    if (sCat && (sl === sCat || sl.includes(sCat) || sCat.includes(sl))) return true;

    if (keywords.some(kw => sl.includes(kw.toLowerCase()) || kw.toLowerCase().includes(sl))) return true;

    // IV / Injections / Medication
    if ((sl.includes('iv') || sl.includes('drip') || sl.includes('infusion') || sl.includes('injection') || sl.includes('medication')) && 
        (sName.includes('intravenous') || sName.includes('injection') || sCat === 'medication')) {
      return true;
    }
    // Wound care / Dressings / Sutures
    if ((sl.includes('wound') || sl.includes('dressing') || sl.includes('suture') || sl.includes('stitch') || sl.includes('bandage')) && 
        (sCat === 'wound care' || sName.includes('wound') || sName.includes('dressing') || sName.includes('suture') || sName.includes('bed sore'))) {
      return true;
    }
    // Critical care / monitoring / Vitals
    if ((sl.includes('critical care') || sl.includes('vital') || sl.includes('monitoring')) && 
        (sCat === 'respiratory care' || sCat === 'health monitoring' || sName.includes('vital') || sName.includes('oxygen') || sName.includes('glucose'))) {
      return true;
    }
    // Maternal, child, delivery, family planning
    if ((sl.includes('maternity') || sl.includes('midwife') || sl.includes('delivery') || sl.includes('antenatal') || sl.includes('pregnancy')) &&
        (sCat === 'pregnancy care' || sCat === 'family planning services' || sName.includes('antenatal') || sName.includes('delivery') || sName.includes('pregnancy'))) {
      return true;
    }
    // Standard nursing procedures for certified nurses
    if (isNurseRole && (sl.includes('nursing') || sCat === 'medication' || sCat === 'wound care' || sCat === 'health monitoring' || sCat === 'urinary care' || sCat === 'diagnostic care')) {
      return true;
    }
    return false;
  });
}

export function PatientApp({ patientId, userName, onHome, onLogout }: { patientId: string, userName?: string, onHome?: () => void, onLogout?: () => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('splash');
  const [searchQuery, setSearchQuery] = useState('');


  const [categories, setCategories] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  
  // App state
  const [selectedService, setSelectedService] = useState<typeof allServices[0] | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedKanoAreaId, setSelectedKanoAreaId] = useState<string>('');
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Auto-fetch patient phone number from profile
  useEffect(() => {
    if (!patientId) return;
    getDoc(doc(db, 'users', patientId)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.phone) {
          setContactPhone(data.phone);
        }
      }
    }).catch(err => console.warn('Could not load user profile phone:', err));
  }, [patientId]);

  const [physicianForm, setPhysicianForm] = useState({
    name: userName || '',
    phone: '',
    email: '',
    address: address || '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });
  const [physicianPaymentStatus, setPhysicianPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const confirmPhysicianBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhysicianPaymentStatus('processing');
    
    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        const bNumber = '#PHY-' + Math.floor(10000 + Math.random() * 90000);
        setBookingNumber(bNumber);
        
        await runTransaction(db, async (trans) => {
          const bookingRef = doc(collection(db, 'physician_bookings'));
          trans.set(bookingRef, {
            bookingId: bNumber,
            clientId: patientId,
            clientName: physicianForm.name,
            clientPhone: physicianForm.phone,
            clientEmail: physicianForm.email,
            clientAddress: physicianForm.address,
            clientLocation: location,
            serviceType: 'Physician Care',
            amount: 15000,
            currency: 'NGN',
            paymentStatus: physicianPaymentMethod === 'test' ? 'paid_test' : 'paid',
            paymentMode: physicianPaymentMethod === 'test' ? 'test' : 'real',
            paymentReference: physicianPaymentMethod === 'test' ? 'TEST_' + Date.now() : 'TXN_' + Date.now() + Math.floor(Math.random()*1000),
            bookingStatus: 'pending_admin_processing',
            preferredDate: physicianForm.date,
            preferredTime: physicianForm.time,
            reason: physicianForm.reason,
            notes: physicianForm.notes,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Create admin notification
          const notifRef = doc(collection(db, 'admin_notifications'));
          trans.set(notifRef, {
            type: 'new_physician_booking',
            title: 'NEW PHYSICIAN BOOKING — ₦15,000 PAID',
            message: `Client ${physicianForm.name} booked a physician for ${physicianForm.date} at ${physicianForm.time}.`,
            bookingId: bNumber,
            amount: 15000,
            clientId: patientId,
            createdAt: serverTimestamp(),
            read: false,
            link: `/admin/physician_bookings/${bookingRef.id}`
          });
        });
        
        setPhysicianPaymentStatus('success');
        setTimeout(() => {
          setStep('physician_success');
          setPhysicianPaymentStatus('idle');
        }, 1500);
      } catch (err) {
        console.warn('Error processing physician booking:', err);
        setPhysicianPaymentStatus('failed');
      }
    }, 2000);
  };

  const [locating, setLocating] = useState(false);
  const [providers, setProviders] = useState<(Provider & { distanceKm: number })[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingNumber, setBookingNumber] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookedProviderPhone, setBookedProviderPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('test');
  const [physicianPaymentMethod, setPhysicianPaymentMethod] = useState('test');
  const [clientBookings, setClientBookings] = useState<any[]>([]);
  const [expandedTracking, setExpandedTracking] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    
    const listToSearch = allServices.length > 0 ? allServices : FALLBACK_SERVICES_LIST;

    const results = listToSearch.filter(service => {
      if (service.active === false) return false;

      const enName = service.name.toLowerCase();
      const haName = t(service.name).toLowerCase();
      const catEn = service.categoryId.toLowerCase();
      const catHa = t(service.categoryId).toLowerCase();

      if (enName.includes(q) || haName.includes(q) || catEn.includes(q) || catHa.includes(q)) return true;

      const keywords = SERVICE_SEARCH_KEYWORDS[service.name] || [];
      if (keywords.some(kw => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()))) return true;

      return false;
    });

    const physicianKeywords = ['physician', 'doctor', 'physician care', 'doctor booking', 'likita', 'asibiti'];
    if (physicianKeywords.some(kw => kw.includes(q) || q.includes(kw))) {
      results.unshift({
        id: 'physician_care_special',
        categoryId: 'PHYSICIAN CARE',
        name: 'Physician Booking',
        price: 15000,
        description: 'Book a professional physician for a consultation.',
        active: true,
        roles: ['Physician']
      } as any);
    }

    return results;
  }, [searchQuery, allServices, t]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [physicianDate, setPhysicianDate] = useState<string>('');
  const [physicianTime, setPhysicianTime] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'in-person'|'online'>('in-person');

  // Fetch bookings
  useEffect(() => {
    if (!patientId) return;

    const unsubCategories = onSnapshot(collection(db, 'serviceCategories'), (snap) => {
      const c: any[] = [];
      snap.forEach(d => c.push({ id: d.id, ...d.data() }));
      setCategories(c.filter(cat => cat.active));
    }, (err) => console.warn('Categories error:', err));

    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      const s: any[] = [];
      snap.forEach(d => s.push({ id: d.id, ...d.data() }));
      setAllServices(s.filter(srv => srv.active));
    }, (err) => console.warn('Services error:', err));

    let normalBookings: any[] = [];
    let physicianBookings: any[] = [];

    const updateBookings = () => {
      const b = [...normalBookings, ...physicianBookings];
      b.sort((x, y) => (y.createdAt?.toMillis ? y.createdAt.toMillis() : y.createdAt) - (x.createdAt?.toMillis ? x.createdAt.toMillis() : x.createdAt));
      setClientBookings(b);
    };

    const q = query(
      collection(db, 'bookings'),
      where('patientId', '==', patientId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      normalBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateBookings();

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const booking = change.doc.data() as Booking;
          const bookingId = change.doc.id;
          
          if (booking.status === 'ACCEPTED') {
            triggerNotification(`${bookingId}-ACCEPTED`, 'Booking Confirmed', 'Your booking has been confirmed.', 'success');
          } else if (booking.status === 'CANCELLED' || booking.status === 'DECLINED') {
            triggerNotification(`${bookingId}-${booking.status}`, 'Booking Status Update', `Your booking has been ${booking.status.toLowerCase()}.`, 'warning');
          } else if (booking.status === 'ARRIVED') {
            triggerNotification(`${bookingId}-ARRIVED`, 'Provider Arrived', 'Your provider has arrived.', 'info');
          } else if (booking.status === 'COMPLETED') {
            triggerNotification(`${bookingId}-COMPLETED`, 'Booking Completed', 'Your booking has been completed.', 'success');
          }
        }
      });
    }, (err: any) => console.warn('Snapshot error in PatientApp bookings:', err?.message || err));
    return () => { unsubscribe(); unsubCategories(); unsubServices(); };
  }, [patientId]);

  // Splash screen auto-advance
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('home'), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);



  const handleUseCurrentLocation = () => {
    setLocating(true);
    setLocationNotice(null);
    console.log("[Client GPS] Requesting live location in Kano...");
    if (!navigator.geolocation) {
      setLocationNotice('GPS not supported by your browser. Please select an area below.');
      if (!location) {
        setLocation({ lat: DEFAULT_KANO_CENTER.lat, lng: DEFAULT_KANO_CENTER.lng });
        setAddress(DEFAULT_KANO_CENTER.name);
      }
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(`[Client GPS] Success: lat=${position.coords.latitude}, lng=${position.coords.longitude}`);
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setAddress('Location detected ✓');
        setLocationNotice('GPS detected successfully ✓');
        setLocating(false);
      },
      (error) => {
        console.warn("[Client GPS] Geolocation notice:", error?.message || error?.code);
        let msg = 'Unable to detect GPS. Kano Center selected; you can pick an area below.';
        if (error.code === error.PERMISSION_DENIED) {
           msg = 'GPS permission denied. Kano Center selected; or choose an area below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
           msg = 'GPS signal unavailable. Pick your Kano area below.';
        } else if (error.code === error.TIMEOUT) {
           msg = 'GPS timed out. Kano Center selected; or choose an area below.';
        }
        setLocationNotice(msg);
        if (!location) {
          setLocation({ lat: DEFAULT_KANO_CENTER.lat, lng: DEFAULT_KANO_CENTER.lng });
          setAddress(DEFAULT_KANO_CENTER.name);
        }
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const findProviders = async () => {
    if (!selectedService) return;
    
    let searchLocation = location;
    
    if (!searchLocation && address && address !== 'Location detected ✓') {
      setLocating(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          searchLocation = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          setLocation(searchLocation);
        }
      } catch (e) {
        console.warn("PatientApp findProviders Nominatim error:", e);
      }
      setLocating(false);
    }
    
    setStep('matching');
    
    try {
      const providersRef = collection(db, 'providers');
      // Query providers collection directly to avoid missing composite index errors on compound filters
      const snap = await getDocs(providersRef);
      const matched: (Provider & { distanceKm: number | null })[] = [];
      
      console.log(`[Provider Discovery] Total provider documents retrieved: ${snap.size}`);

      snap.forEach(docSnap => {
        const p = docSnap.data() as any;
        const pName = p.name || p.fullName || 'Unknown Provider';
        const pId = p.providerId || p.uid || p.userId || docSnap.id;
        
        // 1. Approval evaluation
        const isApproved = isProviderApproved(p);
        
        // 2. Availability evaluation
        const isAvailable = isProviderAvailable(p);
        
        // 3. Busy status evaluation
        const isAcceptingBookings = !p.isBusy;
        
        // 4. Service matching evaluation
        const isServiceMatch = isProviderServiceMatch(p, selectedService);

        // 5. Location evaluation
        const hasValidCoords = Boolean(p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0));
        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && hasValidCoords) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
        }

        const stateName = p.state || p.city || (typeof p.serviceArea === 'string' ? p.serviceArea : 'Kano');
        const isEligible = isApproved && isAvailable && isAcceptingBookings && isServiceMatch;

        // Structured step 8 debugging log
        console.log(`--- PROVIDER DISCOVERY AUDIT --- Provider: ${pName} (${pId}) | Approved: ${isApproved} | Available: ${isAvailable} | Free: ${isAcceptingBookings} | Service Match: ${isServiceMatch} | Eligible: ${isEligible}`);
        
        if (isEligible) {
          matched.push({ ...p, id: docSnap.id, distanceKm });
        } else {
          let rejectReason = '';
          if (!isApproved) rejectReason = 'approved = false';
          else if (!isAvailable) rejectReason = 'available = false';
          else if (!isAcceptingBookings) rejectReason = 'isBusy = true';
          else if (!isServiceMatch) rejectReason = 'service mismatch';
          else rejectReason = 'ineligible';
          console.log(`Provider ${pName} skipped: ${rejectReason}`);
        }
      });
      
      matched.sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        
        if (Math.abs(a.distanceKm - b.distanceKm) < 1) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return a.distanceKm - b.distanceKm;
      });
      
      console.log(`[Provider Discovery] Total eligible providers: ${matched.length}`);
      setProviders(matched);
      
      setTimeout(() => {
        setStep('results');
      }, 1500);
      
    } catch (error: any) {
      console.warn("PatientApp findProviders error:", error?.message || error);
      setProviders([]);
      setStep('results');
    }
  };

  const confirmBooking = async () => {
    if (isBooking) return;
    if (!selectedProvider || !selectedService || !patientId) {
      setBookingError("Missing booking information. Please select a service and provider.");
      return;
    }
    
    console.log("=== BOOKING START ===");
    console.log("Client UID:", patientId);
    console.log("Provider ID:", selectedProvider.id);
    console.log("Selected service:", selectedService);
    console.log("Client location:", location);
    
    setBookingError(null);
    setIsBooking(true);
    try {
      const bNumber = '#NTY-' + Math.floor(10000 + Math.random() * 90000);
      setBookingNumber(bNumber);
      let providerPhone = '';

      // Fetch user profile outside of the transaction
      const clientUserRef = doc(db, 'users', patientId);
      const cSnap = await getDoc(clientUserRef);
      const clientData = cSnap.data();
      const clientPhone = (contactPhone && contactPhone.trim().length > 3)
        ? contactPhone.trim()
        : (cSnap.exists() && clientData?.phone && clientData?.phone.trim().length > 3)
          ? clientData.phone
          : (auth.currentUser?.phoneNumber || '+2348000000000');
      const clientName = (cSnap.exists() && clientData?.fullName)
        ? clientData.fullName
        : (auth.currentUser?.displayName || 'Client');

      if (contactPhone && contactPhone.trim().length > 3) {
        updateDoc(clientUserRef, { phone: contactPhone.trim() }).catch(() => {});
      }
      
      await runTransaction(db, async (t) => {
        const providerRef = doc(db, 'providers', selectedProvider.id || selectedProvider.providerId);
        const pSnap = await t.get(providerRef);
        
        if (!pSnap.exists()) {
          throw new Error("Provider not found");
        }
        
        const pData = pSnap.data();
        providerPhone = pData.phone || '';
        
        const isApproved = isProviderApproved(pData);
        if (!isApproved) {
            throw new Error("PROVIDER_UNVERIFIED: This provider is not fully approved by admin yet.");
        }
        const isAvailable = isProviderAvailable(pData);
        if (!isAvailable) {
            throw new Error("PROVIDER_UNAVAILABLE: This provider is no longer available.");
        }
        if (pData.isBusy === true) {
            throw new Error("PROVIDER_BUSY: This provider is currently busy with another client.");
        }
        const serviceMatches = isProviderServiceMatch(pData, selectedService);
        if (!serviceMatches) {
            throw new Error("PROVIDER_SERVICE_MISMATCH: This provider does not offer the selected service.");
        }
        
        let distanceKm = null;
        if (location && location.lat && location.lng && pData.latitude && pData.longitude) {
          distanceKm = calculateDistance(
            location.lat, location.lng,
            pData.latitude, pData.longitude
          );
        }

        const newBookingRef = doc(collection(db, 'bookings'));
        
        t.set(newBookingRef, {
          bookingId: bNumber,
          patientId: patientId,
          providerId: selectedProvider.id || selectedProvider.providerId,
          service: selectedService.name,
          patientLatitude: location ? location.lat : null,
          patientLongitude: location ? location.lng : null,
          patientAddress: address || 'Kano State',
          date: physicianDate || new Date().toISOString().split('T')[0],
          time: physicianTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: selectedService.price,
          status: 'REQUESTED',
          paymentStatus: paymentMethod === 'test' ? 'paid_test' : 'paid',
          paymentMode: paymentMethod === 'test' ? 'test' : 'real',
          transactionReference: paymentMethod === 'test' ? 'TEST_' + Date.now() : null,
          bookingType: selectedService.name.includes('Physician') ? 'physician' : 'nurse',
          consultationType: selectedService.name.includes('Physician') ? consultationType : null,
          specialty: selectedProvider.specialty || null,
          createdAt: Date.now(),
          clientName: clientName || 'Client',
          clientPhone: clientPhone || '',
          providerName: pData.name || 'Healthcare Provider',
          providerPhone: providerPhone || ''
        });

        t.update(providerRef, {
          isBusy: true,
          currentBookingId: newBookingRef.id
        });
        
        // Save phone to state so we can display it right after booking
        setBookedProviderPhone(providerPhone || '');
      });
      
      triggerNotification('booking-success-' + Date.now(), 'Booking Submitted', 'Booking submitted successfully.', 'success');
      setStep('success');
    } catch (err: any) {
      console.error("=== BOOKING ERROR ===", err);
      setBookingError(err?.message || "Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const TopNav = ({ title, onBack, actionIcon }: { title: string, onBack?: () => void, actionIcon?: React.ReactNode }) => (
    <div className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
      <div className="flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="text-blue-900 hover:bg-gray-50 p-1 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-bold text-blue-900">{title}</h1>
      </div>
      {actionIcon ? actionIcon : <button className="text-blue-900"><Bell className="w-6 h-6" /></button>}
    </div>
  );

  const BottomNav = () => (
    <div className="bg-white border-t border-gray-100 flex items-center justify-around py-3 px-6 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button onClick={() => setStep('home')} className={cn("flex flex-col items-center gap-1", step === 'home' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'home' ? "bg-teal-50" : "")}>
          <Home className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">{t('Home')}</span>
      </button>
      <button onClick={() => setStep('bookings')} className={cn("flex flex-col items-center gap-1", step === 'bookings' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'bookings' ? "bg-teal-50" : "")}>
          <ActivitySquare className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">{t('Bookings')}</span>
      </button>
      <button onClick={() => setStep('pharmacy')} className={cn("flex flex-col items-center gap-1", step === 'pharmacy' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'pharmacy' ? "bg-teal-50" : "")}>
          <Store className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">{t('Pharmacy Store')}</span>
      </button>
      <button onClick={() => setStep('reports')} className={cn("flex flex-col items-center gap-1", step === 'reports' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'reports' ? "bg-teal-50" : "")}>
          <FileText className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">{t('Reports', 'Reports')}</span>
      </button>
      <button onClick={() => setStep('profile')} className={cn("flex flex-col items-center gap-1", step === 'profile' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'profile' ? "bg-teal-50" : "")}>
          <UserCircle className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">{t('Profile', 'Profile')}</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen sm:h-[850px] sm:my-10 bg-slate-50 sm:rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col font-sans">
      <div className="flex-1 overflow-y-auto relative bg-slate-50 pb-20 scrollbar-hide">
        
        {step === 'splash' && (
          <div className="flex flex-col items-center justify-center h-full bg-blue-900 text-white p-8 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
              <HeartPulse className="w-12 h-12 text-blue-900" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Nurse To You</h1>
            <p className="text-blue-200">Professional Healthcare, Anywhere.</p>
          </div>
        )}

        

        {step === 'home' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-300">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
              <div>
                <p className="text-gray-500 text-sm">{t('Hello')}, {userName?.split(' ')[0]}</p>
                <p className="text-blue-900 font-bold flex items-center gap-1 text-sm"><MapPin className="w-4 h-4"/> Kano State</p>
              </div>
              <LanguageSwitcher className="mr-3" />
              <button className="relative p-2 text-blue-900 bg-white rounded-full shadow-sm border border-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <div className="relative z-10">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search for a service...', 'Search for a service...')} 
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-10 outline-none focus:border-blue-900 text-sm shadow-sm"
                />
                {searchQuery.trim().length > 0 && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {searchQuery.trim().length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-[60vh] overflow-y-auto z-50">
                    {searchResults.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {searchResults.map(service => (
                          <div 
                            key={service.id} 
                            onClick={() => {
                              if (service.id === 'physician_care_special') {
                                setSearchQuery('');
                                setStep('physician_booking_form');
                                return;
                              }
                              setSelectedService(service);
                              setSelectedCategory({ id: service.categoryId, name: service.categoryId, active: true });
                              setSearchQuery('');
                              setStep('service_details');
                            }}
                            className="p-3 bg-gray-50 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors flex flex-col gap-2 border border-transparent hover:border-blue-100"
                          >
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{t(service.name)}</h4>
                              <p className="text-xs text-blue-600 font-medium">{t(service.categoryId)}</p>
                            </div>
                            <p className="text-gray-500 text-xs line-clamp-1">{t(service.description)}</p>
                            <div className="flex justify-between items-center mt-1">
                              {service.price ? (
                                <span className="font-bold text-teal-600 text-sm">₦{service.price.toLocaleString()}</span>
                              ) : (
                                <span className="text-xs text-gray-400">{t('Price varies')}</span>
                              )}
                              <button className="bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                {t('Book Now', 'Book Now')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-gray-300" />
                        <p className="text-sm font-medium">{t('No services found. Try another search.', 'No services found. Try another search.')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 w-2/3">
                  <h2 className="text-2xl font-bold mb-2">{t('Need a Nurse?')}</h2>
                  <p className="text-blue-200 text-sm mb-6 leading-relaxed">{t('Book verified professionals to your location instantly.')}</p>
                  <button onClick={() => setStep('all_services')} className="bg-white text-blue-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
                    {t('Book a Nurse')} <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                {/* Decorative shapes instead of image for now */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-800 rounded-tl-full opacity-50 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-teal-400 rounded-full opacity-20 z-0"></div>
              </div>

                            {/* Menstrual & Fertility Tracker Banner */}
              <div className="bg-pink-100 rounded-3xl p-6 text-pink-900 relative overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow mb-6 border border-pink-200" onClick={() => setStep('menstrual_tracker')}>
                <div className="relative z-10 w-2/3">
                  <h2 className="text-2xl font-bold mb-2">{t('Menstrual & Fertility Tracker')}</h2>
                  <p className="text-pink-700 text-sm mb-6 leading-relaxed font-medium">{t('Track your cycle and view estimated fertile days.')}</p>
                  <button onClick={(e) => { e.stopPropagation(); setStep('menstrual_tracker'); }} className="bg-pink-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-pink-700 shadow-sm">
                    {t('Open Tracker')} <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-pink-200 rounded-tl-full opacity-50 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-pink-300 rounded-full opacity-30 z-0 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6 text-pink-600" />
                </div>
              </div>

              {/* Book a Physician Promo Banner */}
              <div className="bg-purple-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setStep('physician_booking_form')}>
                <div className="relative z-10 w-2/3">
                  <h2 className="text-2xl font-bold mb-2">{t('Book a Physician')}</h2>
                  <p className="text-purple-200 text-sm mb-6 leading-relaxed">{t('Consult with specialist doctors online or in-person.')}</p>
                  <button onClick={(e) => { e.stopPropagation(); setStep('physician_booking_form'); }} className="bg-white text-purple-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
                    {t('Find a Doctor')} <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-purple-800 rounded-tl-full opacity-50 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-purple-400 rounded-full opacity-20 z-0"></div>
              </div>
              
              {/* Pharmacy Promo Banner */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setStep('pharmacy')}>
                <div className="relative z-10 w-2/3">
                  <h2 className="text-2xl font-bold mb-2">{t('Pharmacy Store')}</h2>
                  <p className="text-teal-100 text-sm mb-6 leading-relaxed">{t('Order medicines to your door')}</p>
                  <button onClick={(e) => { e.stopPropagation(); setStep('pharmacy'); }} className="bg-white text-teal-900 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-teal-50 w-max">
                    {t('Order Now')} <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-teal-800 rounded-tl-full opacity-30 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-teal-300 rounded-full opacity-20 z-0"></div>
              </div>
              
              {bookingNumber && (
                <div>
                  <h3 className="text-gray-900 font-semibold mb-3">{t('Upcoming Booking')}</h3>
                  <div className="bg-white border-l-4 border-teal-400 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1">{selectedProvider?.name || t('Assigned Provider')} <CheckCircle className="w-3 h-3 text-teal-500"/></h4>
                          <p className="text-gray-500 text-xs">{selectedService?.name || t('Healthcare Service')}</p>
                        </div>
                      </div>
                      <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded">{t('REQUESTED')}</span>
                    </div>
                    <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400"/> Just now
                      </div>
                      <div className="w-px h-4 bg-gray-200"></div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                        <Navigation className="w-4 h-4"/> Pending ETA
                      </div>
                    </div>
                    {bookedProviderPhone && (
                      <div className="pt-2 flex flex-col gap-2">
                        <p className="text-xs text-gray-500 font-medium">Contact: {bookedProviderPhone}</p>
                        <a 
                          href={`tel:${bookedProviderPhone}`}
                          className="w-full bg-teal-50 text-teal-700 border border-teal-200 font-bold py-2.5 rounded-xl hover:bg-teal-100 flex items-center justify-center gap-2 transition-colors text-sm"
                        >
                          📞 {t('Call Provider')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              </div>
            <BottomNav />
          </div>
        )}

        {step === 'all_services' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Nurse To You')} onBack={() => setStep('home')} />
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Healthcare Services')}</h2>
              <p className="text-gray-500 text-sm mb-6">{t('Select a category to view available services.')}</p>
              
              <div className="grid grid-cols-2 gap-4">
                {(categories.length > 0 ? categories : [{"id":"MEDICATION","name":"MEDICATION","active":true},{"id":"WOUND CARE","name":"WOUND CARE","active":true},{"id":"RESPIRATORY CARE","name":"RESPIRATORY CARE","active":true},{"id":"HEALTH MONITORING","name":"HEALTH MONITORING","active":true},{"id":"URINARY CARE","name":"URINARY CARE","active":true},{"id":"GASTRO CARE","name":"GASTRO CARE","active":true},{"id":"PHYSICAL CARE","name":"PHYSICAL CARE","active":true},{"id":"DIAGNOSTIC CARE","name":"DIAGNOSTIC CARE","active":true},{"id":"OTHER LABORATORY SERVICES","name":"OTHER LABORATORY SERVICES","active":true},{"id":"PREGNANCY CARE","name":"PREGNANCY CARE","active":true},{"id":"FAMILY PLANNING SERVICES","name":"FAMILY PLANNING SERVICES","active":true},{"id":"GENERAL HEALTH EDUCATION","name":"GENERAL HEALTH EDUCATION","active":true},{"id":"ORAL HEALTH","name":"ORAL HEALTH","active":true},{"id":"EYE CARE","name":"EYE CARE","active":true},{"id":"EAR, NOSE AND THROAT (ENT) CARE","name":"EAR, NOSE AND THROAT (ENT) CARE","active":true},{"id":"SKIN CARE","name":"SKIN CARE","active":true},{"id":"ORTHOPEDIC CARE","name":"ORTHOPEDIC CARE","active":true},{"id":"MENTAL HEALTH","name":"MENTAL HEALTH","active":true},{"id":"PEDIATRIC - KIDS HEALTH","name":"PEDIATRIC / KIDS HEALTH","active":true},{"id":"AMBULANCE SERVICE","name":"AMBULANCE SERVICE","active":true}]).map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { 
                      if (cat.name === 'Pharmacy Services') {
                        setStep('pharmacy');
                      } else if (cat.name === 'Physician Care' || cat.name === 'Specialist Care') {
                        setStep('physician_categories');
                      } else {
                        setSelectedCategory(cat); 
                        setStep('category_services'); 
                      }
                    }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 text-left flex flex-col gap-3 hover:border-blue-200 shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-200/60">
                       {CATEGORY_ICONS[cat.name] || '🏥'}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{t(cat.name)}</h3>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'category_services' && selectedCategory && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={selectedCategory.name} onBack={() => setStep('all_services')} />
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCategory.name}</h2>
                <p className="text-gray-500 text-sm">Select a specific service to proceed.</p>
              </div>

              {selectedCategory.name === 'Ambulance Service' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-red-900 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5"/> Emergency Notice
                  </h3>
                  <p className="text-red-700 text-sm leading-relaxed">
                    If this is a life-threatening emergency, please contact local emergency medical services immediately. This app does not replace urgent emergency response.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {(allServices.length > 0 ? allServices : [{"id":"fs_1","categoryId":"MEDICATION","name":"Injection","price":5000,"roles":["RN","LPN"],"description":"Professional Injection","active":true},{"id":"fs_2","categoryId":"MEDICATION","name":"Intravenous Therapy","price":5000,"roles":["RN","LPN"],"description":"Professional Intravenous Therapy","active":true},{"id":"fs_3","categoryId":"MEDICATION","name":"Transdermal","price":5000,"roles":["RN","LPN"],"description":"Professional Transdermal","active":true},{"id":"fs_4","categoryId":"MEDICATION","name":"Patches","price":5000,"roles":["RN","LPN"],"description":"Professional Patches","active":true},{"id":"fs_5","categoryId":"MEDICATION","name":"Adverse Effects Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Adverse Effects Monitoring","active":true},{"id":"fs_6","categoryId":"WOUND CARE","name":"Dressing Procedures","price":5000,"roles":["RN","LPN"],"description":"Professional Dressing Procedures","active":true},{"id":"fs_7","categoryId":"WOUND CARE","name":"Suture and Staple Removal","price":5000,"roles":["RN","LPN"],"description":"Professional Suture and Staple Removal","active":true},{"id":"fs_8","categoryId":"WOUND CARE","name":"Second Closure","price":5000,"roles":["RN","LPN"],"description":"Professional Second Closure","active":true},{"id":"fs_9","categoryId":"WOUND CARE","name":"Negative Pressure Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Negative Pressure Monitoring","active":true},{"id":"fs_10","categoryId":"WOUND CARE","name":"Bed Sore Care","price":5000,"roles":["RN","LPN"],"description":"Professional Bed Sore Care","active":true},{"id":"fs_11","categoryId":"RESPIRATORY CARE","name":"Nebulizer Treatment","price":5000,"roles":["RN","LPN"],"description":"Professional Nebulizer Treatment","active":true},{"id":"fs_12","categoryId":"RESPIRATORY CARE","name":"Asthmatic Care","price":5000,"roles":["RN","LPN"],"description":"Professional Asthmatic Care","active":true},{"id":"fs_13","categoryId":"RESPIRATORY CARE","name":"Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Monitoring","active":true},{"id":"fs_14","categoryId":"RESPIRATORY CARE","name":"Oxygen Therapy","price":5000,"roles":["RN","LPN"],"description":"Professional Oxygen Therapy","active":true},{"id":"fs_15","categoryId":"HEALTH MONITORING","name":"Vital Signs Tracking","price":5000,"roles":["RN","LPN"],"description":"Professional Vital Signs Tracking","active":true},{"id":"fs_16","categoryId":"HEALTH MONITORING","name":"Blood Glucose Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Blood Glucose Monitoring","active":true},{"id":"fs_17","categoryId":"HEALTH MONITORING","name":"Weight Scaling","price":5000,"roles":["RN","LPN"],"description":"Professional Weight Scaling","active":true},{"id":"fs_18","categoryId":"HEALTH MONITORING","name":"Exercise","price":5000,"roles":["RN","LPN"],"description":"Professional Exercise","active":true},{"id":"fs_19","categoryId":"HEALTH MONITORING","name":"Diet","price":5000,"roles":["RN","LPN"],"description":"Professional Diet","active":true},{"id":"fs_20","categoryId":"URINARY CARE","name":"Catheterization and Catheter Care","price":5000,"roles":["RN","LPN"],"description":"Professional Catheterization and Catheter Care","active":true},{"id":"fs_21","categoryId":"URINARY CARE","name":"Irrigation","price":5000,"roles":["RN","LPN"],"description":"Professional Irrigation","active":true},{"id":"fs_22","categoryId":"URINARY CARE","name":"Urine Testing","price":5000,"roles":["RN","LPN"],"description":"Professional Urine Testing","active":true},{"id":"fs_23","categoryId":"GASTRO CARE","name":"Ostomy and Stoma Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ostomy and Stoma Care","active":true},{"id":"fs_24","categoryId":"GASTRO CARE","name":"Colostomy Bag","price":5000,"roles":["RN","LPN"],"description":"Professional Colostomy Bag","active":true},{"id":"fs_25","categoryId":"GASTRO CARE","name":"Abdominal Skin Care","price":5000,"roles":["RN","LPN"],"description":"Professional Abdominal Skin Care","active":true},{"id":"fs_26","categoryId":"GASTRO CARE","name":"Tube Feeding","price":5000,"roles":["RN","LPN"],"description":"Professional Tube Feeding","active":true},{"id":"fs_27","categoryId":"GASTRO CARE","name":"NG Tube Insertion and Care","price":5000,"roles":["RN","LPN"],"description":"Professional NG Tube Insertion and Care","active":true},{"id":"fs_28","categoryId":"GASTRO CARE","name":"Enema","price":5000,"roles":["RN","LPN"],"description":"Professional Enema","active":true},{"id":"fs_29","categoryId":"PHYSICAL CARE","name":"Mobilization","price":5000,"roles":["RN","LPN"],"description":"Professional Mobilization","active":true},{"id":"fs_30","categoryId":"PHYSICAL CARE","name":"Ambulatory Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ambulatory Care","active":true},{"id":"fs_31","categoryId":"PHYSICAL CARE","name":"Skeletal Traction Care","price":5000,"roles":["RN","LPN"],"description":"Professional Skeletal Traction Care","active":true},{"id":"fs_32","categoryId":"PHYSICAL CARE","name":"Cast and Splint Care","price":5000,"roles":["RN","LPN"],"description":"Professional Cast and Splint Care","active":true},{"id":"fs_33","categoryId":"PHYSICAL CARE","name":"Healthy Exercises","price":5000,"roles":["RN","LPN"],"description":"Professional Healthy Exercises","active":true},{"id":"fs_34","categoryId":"DIAGNOSTIC CARE","name":"Specimen Collection","price":5000,"roles":["RN","LPN"],"description":"Professional Specimen Collection","active":true},{"id":"fs_35","categoryId":"DIAGNOSTIC CARE","name":"Urinalysis","price":5000,"roles":["RN","LPN"],"description":"Professional Urinalysis","active":true},{"id":"fs_36","categoryId":"DIAGNOSTIC CARE","name":"Pregnancy Test","price":5000,"roles":["RN","LPN"],"description":"Professional Pregnancy Test","active":true},{"id":"fs_37","categoryId":"DIAGNOSTIC CARE","name":"Malaria Testing","price":5000,"roles":["RN","LPN"],"description":"Professional Malaria Testing","active":true},{"id":"fs_38","categoryId":"DIAGNOSTIC CARE","name":"Instant Ultrasound","price":5000,"roles":["RN","LPN"],"description":"Professional Instant Ultrasound","active":true},{"id":"fs_39","categoryId":"DIAGNOSTIC CARE","name":"Instant X-Ray","price":5000,"roles":["RN","LPN"],"description":"Professional Instant X-Ray","active":true},{"id":"fs_40","categoryId":"DIAGNOSTIC CARE","name":"All RDTs","price":5000,"roles":["RN","LPN"],"description":"Professional All RDTs","active":true},{"id":"fs_41","categoryId":"OTHER LABORATORY SERVICES","name":"Fasting Blood Sugar","price":5000,"roles":["RN","LPN"],"description":"Professional Fasting Blood Sugar","active":true},{"id":"fs_42","categoryId":"OTHER LABORATORY SERVICES","name":"Random Blood Sugar","price":5000,"roles":["RN","LPN"],"description":"Professional Random Blood Sugar","active":true},{"id":"fs_43","categoryId":"OTHER LABORATORY SERVICES","name":"H. Pylori","price":5000,"roles":["RN","LPN"],"description":"Professional H. Pylori","active":true},{"id":"fs_44","categoryId":"OTHER LABORATORY SERVICES","name":"Retroviral Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Retroviral Screening","active":true},{"id":"fs_45","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis A Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis A Screening","active":true},{"id":"fs_46","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis B Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis B Screening","active":true},{"id":"fs_47","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis C Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis C Screening","active":true},{"id":"fs_48","categoryId":"OTHER LABORATORY SERVICES","name":"Gonorrhea Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Gonorrhea Screening","active":true},{"id":"fs_49","categoryId":"OTHER LABORATORY SERVICES","name":"Syphilis Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Syphilis Screening","active":true},{"id":"fs_50","categoryId":"OTHER LABORATORY SERVICES","name":"Full Blood Count","price":5000,"roles":["RN","LPN"],"description":"Professional Full Blood Count","active":true},{"id":"fs_51","categoryId":"OTHER LABORATORY SERVICES","name":"Blood Grouping and RH","price":5000,"roles":["RN","LPN"],"description":"Professional Blood Grouping and RH","active":true},{"id":"fs_52","categoryId":"OTHER LABORATORY SERVICES","name":"Electrolyte, Urea and Creatinine","price":5000,"roles":["RN","LPN"],"description":"Professional Electrolyte, Urea and Creatinine","active":true},{"id":"fs_53","categoryId":"OTHER LABORATORY SERVICES","name":"Kidney Function Test","price":5000,"roles":["RN","LPN"],"description":"Professional Kidney Function Test","active":true},{"id":"fs_54","categoryId":"OTHER LABORATORY SERVICES","name":"Liver Function Test","price":5000,"roles":["RN","LPN"],"description":"Professional Liver Function Test","active":true},{"id":"fs_55","categoryId":"OTHER LABORATORY SERVICES","name":"Sputum Collection","price":5000,"roles":["RN","LPN"],"description":"Professional Sputum Collection","active":true},{"id":"fs_56","categoryId":"PREGNANCY CARE","name":"Pregnancy Test","price":5000,"roles":["RN","LPN"],"description":"Professional Pregnancy Test","active":true},{"id":"fs_57","categoryId":"PREGNANCY CARE","name":"Antenatal Care","price":5000,"roles":["RN","LPN"],"description":"Professional Antenatal Care","active":true},{"id":"fs_58","categoryId":"PREGNANCY CARE","name":"Delivery Care","price":5000,"roles":["RN","LPN"],"description":"Professional Delivery Care","active":true},{"id":"fs_59","categoryId":"PREGNANCY CARE","name":"Elective CS","price":5000,"roles":["RN","LPN"],"description":"Professional Elective CS","active":true},{"id":"fs_60","categoryId":"PREGNANCY CARE","name":"Emergency CS","price":5000,"roles":["RN","LPN"],"description":"Professional Emergency CS","active":true},{"id":"fs_61","categoryId":"PREGNANCY CARE","name":"CS Wound Care","price":5000,"roles":["RN","LPN"],"description":"Professional CS Wound Care","active":true},{"id":"fs_62","categoryId":"FAMILY PLANNING SERVICES","name":"Health Education and Decision Making Practice","price":5000,"roles":["RN","LPN"],"description":"Professional Health Education and Decision Making Practice","active":true},{"id":"fs_63","categoryId":"FAMILY PLANNING SERVICES","name":"Oral Pills","price":5000,"roles":["RN","LPN"],"description":"Professional Oral Pills","active":true},{"id":"fs_64","categoryId":"FAMILY PLANNING SERVICES","name":"Injectable Methods","price":5000,"roles":["RN","LPN"],"description":"Professional Injectable Methods","active":true},{"id":"fs_65","categoryId":"FAMILY PLANNING SERVICES","name":"Intrauterine Device","price":5000,"roles":["RN","LPN"],"description":"Professional Intrauterine Device","active":true},{"id":"fs_66","categoryId":"FAMILY PLANNING SERVICES","name":"Implant","price":5000,"roles":["RN","LPN"],"description":"Professional Implant","active":true},{"id":"fs_67","categoryId":"FAMILY PLANNING SERVICES","name":"Patch","price":5000,"roles":["RN","LPN"],"description":"Professional Patch","active":true},{"id":"fs_68","categoryId":"FAMILY PLANNING SERVICES","name":"Barrier Methods","price":5000,"roles":["RN","LPN"],"description":"Professional Barrier Methods","active":true},{"id":"fs_69","categoryId":"FAMILY PLANNING SERVICES","name":"Implant Removal","price":5000,"roles":["RN","LPN"],"description":"Professional Implant Removal","active":true},{"id":"fs_70","categoryId":"FAMILY PLANNING SERVICES","name":"Other Family Planning Care","price":5000,"roles":["RN","LPN"],"description":"Professional Other Family Planning Care","active":true},{"id":"fs_71","categoryId":"GENERAL HEALTH EDUCATION","name":"General Health Education","price":5000,"roles":["RN","LPN"],"description":"Professional General Health Education","active":true},{"id":"fs_72","categoryId":"ORAL HEALTH","name":"Oral Health","price":5000,"roles":["RN","LPN"],"description":"Professional Oral Health","active":true},{"id":"fs_73","categoryId":"EYE CARE","name":"Eye Care","price":5000,"roles":["RN","LPN"],"description":"Professional Eye Care","active":true},{"id":"fs_74","categoryId":"EAR, NOSE AND THROAT (ENT) CARE","name":"Ear, Nose and Throat (ENT) Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ear, Nose and Throat (ENT) Care","active":true},{"id":"fs_75","categoryId":"SKIN CARE","name":"Skin Care","price":5000,"roles":["RN","LPN"],"description":"Professional Skin Care","active":true},{"id":"fs_76","categoryId":"ORTHOPEDIC CARE","name":"Orthopedic Care","price":5000,"roles":["RN","LPN"],"description":"Professional Orthopedic Care","active":true},{"id":"fs_77","categoryId":"MENTAL HEALTH","name":"Mental Health Support","price":5000,"roles":["RN","LPN"],"description":"Professional Mental Health Support","active":true},{"id":"fs_78","categoryId":"PEDIATRIC - KIDS HEALTH","name":"Pediatric / Kids Health","price":5000,"roles":["RN","LPN"],"description":"Professional Pediatric / Kids Health","active":true},{"id":"fs_79","categoryId":"AMBULANCE SERVICE","name":"Request Ambulance","price":5000,"roles":["RN","LPN"],"description":"Professional Request Ambulance","active":true}]).filter(s => s.categoryId === selectedCategory.name).map(service => (
                  <button 
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep('service_details'); }}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left flex gap-4 hover:border-blue-200 shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center">
                      <ActivitySquare className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-1">{service.name}</h3>
                      <p className="text-gray-500 text-xs mb-3 leading-relaxed">{service.description}</p>
                      <p className="text-blue-900 text-xs font-bold flex items-center gap-1">
                         Starts from ₦{service.price?.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
                {(allServices.length > 0 ? allServices : [{"id":"fs_1","categoryId":"MEDICATION","name":"Injection","price":5000,"roles":["RN","LPN"],"description":"Professional Injection","active":true},{"id":"fs_2","categoryId":"MEDICATION","name":"Intravenous Therapy","price":5000,"roles":["RN","LPN"],"description":"Professional Intravenous Therapy","active":true},{"id":"fs_3","categoryId":"MEDICATION","name":"Transdermal","price":5000,"roles":["RN","LPN"],"description":"Professional Transdermal","active":true},{"id":"fs_4","categoryId":"MEDICATION","name":"Patches","price":5000,"roles":["RN","LPN"],"description":"Professional Patches","active":true},{"id":"fs_5","categoryId":"MEDICATION","name":"Adverse Effects Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Adverse Effects Monitoring","active":true},{"id":"fs_6","categoryId":"WOUND CARE","name":"Dressing Procedures","price":5000,"roles":["RN","LPN"],"description":"Professional Dressing Procedures","active":true},{"id":"fs_7","categoryId":"WOUND CARE","name":"Suture and Staple Removal","price":5000,"roles":["RN","LPN"],"description":"Professional Suture and Staple Removal","active":true},{"id":"fs_8","categoryId":"WOUND CARE","name":"Second Closure","price":5000,"roles":["RN","LPN"],"description":"Professional Second Closure","active":true},{"id":"fs_9","categoryId":"WOUND CARE","name":"Negative Pressure Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Negative Pressure Monitoring","active":true},{"id":"fs_10","categoryId":"WOUND CARE","name":"Bed Sore Care","price":5000,"roles":["RN","LPN"],"description":"Professional Bed Sore Care","active":true},{"id":"fs_11","categoryId":"RESPIRATORY CARE","name":"Nebulizer Treatment","price":5000,"roles":["RN","LPN"],"description":"Professional Nebulizer Treatment","active":true},{"id":"fs_12","categoryId":"RESPIRATORY CARE","name":"Asthmatic Care","price":5000,"roles":["RN","LPN"],"description":"Professional Asthmatic Care","active":true},{"id":"fs_13","categoryId":"RESPIRATORY CARE","name":"Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Monitoring","active":true},{"id":"fs_14","categoryId":"RESPIRATORY CARE","name":"Oxygen Therapy","price":5000,"roles":["RN","LPN"],"description":"Professional Oxygen Therapy","active":true},{"id":"fs_15","categoryId":"HEALTH MONITORING","name":"Vital Signs Tracking","price":5000,"roles":["RN","LPN"],"description":"Professional Vital Signs Tracking","active":true},{"id":"fs_16","categoryId":"HEALTH MONITORING","name":"Blood Glucose Monitoring","price":5000,"roles":["RN","LPN"],"description":"Professional Blood Glucose Monitoring","active":true},{"id":"fs_17","categoryId":"HEALTH MONITORING","name":"Weight Scaling","price":5000,"roles":["RN","LPN"],"description":"Professional Weight Scaling","active":true},{"id":"fs_18","categoryId":"HEALTH MONITORING","name":"Exercise","price":5000,"roles":["RN","LPN"],"description":"Professional Exercise","active":true},{"id":"fs_19","categoryId":"HEALTH MONITORING","name":"Diet","price":5000,"roles":["RN","LPN"],"description":"Professional Diet","active":true},{"id":"fs_20","categoryId":"URINARY CARE","name":"Catheterization and Catheter Care","price":5000,"roles":["RN","LPN"],"description":"Professional Catheterization and Catheter Care","active":true},{"id":"fs_21","categoryId":"URINARY CARE","name":"Irrigation","price":5000,"roles":["RN","LPN"],"description":"Professional Irrigation","active":true},{"id":"fs_22","categoryId":"URINARY CARE","name":"Urine Testing","price":5000,"roles":["RN","LPN"],"description":"Professional Urine Testing","active":true},{"id":"fs_23","categoryId":"GASTRO CARE","name":"Ostomy and Stoma Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ostomy and Stoma Care","active":true},{"id":"fs_24","categoryId":"GASTRO CARE","name":"Colostomy Bag","price":5000,"roles":["RN","LPN"],"description":"Professional Colostomy Bag","active":true},{"id":"fs_25","categoryId":"GASTRO CARE","name":"Abdominal Skin Care","price":5000,"roles":["RN","LPN"],"description":"Professional Abdominal Skin Care","active":true},{"id":"fs_26","categoryId":"GASTRO CARE","name":"Tube Feeding","price":5000,"roles":["RN","LPN"],"description":"Professional Tube Feeding","active":true},{"id":"fs_27","categoryId":"GASTRO CARE","name":"NG Tube Insertion and Care","price":5000,"roles":["RN","LPN"],"description":"Professional NG Tube Insertion and Care","active":true},{"id":"fs_28","categoryId":"GASTRO CARE","name":"Enema","price":5000,"roles":["RN","LPN"],"description":"Professional Enema","active":true},{"id":"fs_29","categoryId":"PHYSICAL CARE","name":"Mobilization","price":5000,"roles":["RN","LPN"],"description":"Professional Mobilization","active":true},{"id":"fs_30","categoryId":"PHYSICAL CARE","name":"Ambulatory Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ambulatory Care","active":true},{"id":"fs_31","categoryId":"PHYSICAL CARE","name":"Skeletal Traction Care","price":5000,"roles":["RN","LPN"],"description":"Professional Skeletal Traction Care","active":true},{"id":"fs_32","categoryId":"PHYSICAL CARE","name":"Cast and Splint Care","price":5000,"roles":["RN","LPN"],"description":"Professional Cast and Splint Care","active":true},{"id":"fs_33","categoryId":"PHYSICAL CARE","name":"Healthy Exercises","price":5000,"roles":["RN","LPN"],"description":"Professional Healthy Exercises","active":true},{"id":"fs_34","categoryId":"DIAGNOSTIC CARE","name":"Specimen Collection","price":5000,"roles":["RN","LPN"],"description":"Professional Specimen Collection","active":true},{"id":"fs_35","categoryId":"DIAGNOSTIC CARE","name":"Urinalysis","price":5000,"roles":["RN","LPN"],"description":"Professional Urinalysis","active":true},{"id":"fs_36","categoryId":"DIAGNOSTIC CARE","name":"Pregnancy Test","price":5000,"roles":["RN","LPN"],"description":"Professional Pregnancy Test","active":true},{"id":"fs_37","categoryId":"DIAGNOSTIC CARE","name":"Malaria Testing","price":5000,"roles":["RN","LPN"],"description":"Professional Malaria Testing","active":true},{"id":"fs_38","categoryId":"DIAGNOSTIC CARE","name":"Instant Ultrasound","price":5000,"roles":["RN","LPN"],"description":"Professional Instant Ultrasound","active":true},{"id":"fs_39","categoryId":"DIAGNOSTIC CARE","name":"Instant X-Ray","price":5000,"roles":["RN","LPN"],"description":"Professional Instant X-Ray","active":true},{"id":"fs_40","categoryId":"DIAGNOSTIC CARE","name":"All RDTs","price":5000,"roles":["RN","LPN"],"description":"Professional All RDTs","active":true},{"id":"fs_41","categoryId":"OTHER LABORATORY SERVICES","name":"Fasting Blood Sugar","price":5000,"roles":["RN","LPN"],"description":"Professional Fasting Blood Sugar","active":true},{"id":"fs_42","categoryId":"OTHER LABORATORY SERVICES","name":"Random Blood Sugar","price":5000,"roles":["RN","LPN"],"description":"Professional Random Blood Sugar","active":true},{"id":"fs_43","categoryId":"OTHER LABORATORY SERVICES","name":"H. Pylori","price":5000,"roles":["RN","LPN"],"description":"Professional H. Pylori","active":true},{"id":"fs_44","categoryId":"OTHER LABORATORY SERVICES","name":"Retroviral Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Retroviral Screening","active":true},{"id":"fs_45","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis A Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis A Screening","active":true},{"id":"fs_46","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis B Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis B Screening","active":true},{"id":"fs_47","categoryId":"OTHER LABORATORY SERVICES","name":"Hepatitis C Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Hepatitis C Screening","active":true},{"id":"fs_48","categoryId":"OTHER LABORATORY SERVICES","name":"Gonorrhea Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Gonorrhea Screening","active":true},{"id":"fs_49","categoryId":"OTHER LABORATORY SERVICES","name":"Syphilis Screening","price":5000,"roles":["RN","LPN"],"description":"Professional Syphilis Screening","active":true},{"id":"fs_50","categoryId":"OTHER LABORATORY SERVICES","name":"Full Blood Count","price":5000,"roles":["RN","LPN"],"description":"Professional Full Blood Count","active":true},{"id":"fs_51","categoryId":"OTHER LABORATORY SERVICES","name":"Blood Grouping and RH","price":5000,"roles":["RN","LPN"],"description":"Professional Blood Grouping and RH","active":true},{"id":"fs_52","categoryId":"OTHER LABORATORY SERVICES","name":"Electrolyte, Urea and Creatinine","price":5000,"roles":["RN","LPN"],"description":"Professional Electrolyte, Urea and Creatinine","active":true},{"id":"fs_53","categoryId":"OTHER LABORATORY SERVICES","name":"Kidney Function Test","price":5000,"roles":["RN","LPN"],"description":"Professional Kidney Function Test","active":true},{"id":"fs_54","categoryId":"OTHER LABORATORY SERVICES","name":"Liver Function Test","price":5000,"roles":["RN","LPN"],"description":"Professional Liver Function Test","active":true},{"id":"fs_55","categoryId":"OTHER LABORATORY SERVICES","name":"Sputum Collection","price":5000,"roles":["RN","LPN"],"description":"Professional Sputum Collection","active":true},{"id":"fs_56","categoryId":"PREGNANCY CARE","name":"Pregnancy Test","price":5000,"roles":["RN","LPN"],"description":"Professional Pregnancy Test","active":true},{"id":"fs_57","categoryId":"PREGNANCY CARE","name":"Antenatal Care","price":5000,"roles":["RN","LPN"],"description":"Professional Antenatal Care","active":true},{"id":"fs_58","categoryId":"PREGNANCY CARE","name":"Delivery Care","price":5000,"roles":["RN","LPN"],"description":"Professional Delivery Care","active":true},{"id":"fs_59","categoryId":"PREGNANCY CARE","name":"Elective CS","price":5000,"roles":["RN","LPN"],"description":"Professional Elective CS","active":true},{"id":"fs_60","categoryId":"PREGNANCY CARE","name":"Emergency CS","price":5000,"roles":["RN","LPN"],"description":"Professional Emergency CS","active":true},{"id":"fs_61","categoryId":"PREGNANCY CARE","name":"CS Wound Care","price":5000,"roles":["RN","LPN"],"description":"Professional CS Wound Care","active":true},{"id":"fs_62","categoryId":"FAMILY PLANNING SERVICES","name":"Health Education and Decision Making Practice","price":5000,"roles":["RN","LPN"],"description":"Professional Health Education and Decision Making Practice","active":true},{"id":"fs_63","categoryId":"FAMILY PLANNING SERVICES","name":"Oral Pills","price":5000,"roles":["RN","LPN"],"description":"Professional Oral Pills","active":true},{"id":"fs_64","categoryId":"FAMILY PLANNING SERVICES","name":"Injectable Methods","price":5000,"roles":["RN","LPN"],"description":"Professional Injectable Methods","active":true},{"id":"fs_65","categoryId":"FAMILY PLANNING SERVICES","name":"Intrauterine Device","price":5000,"roles":["RN","LPN"],"description":"Professional Intrauterine Device","active":true},{"id":"fs_66","categoryId":"FAMILY PLANNING SERVICES","name":"Implant","price":5000,"roles":["RN","LPN"],"description":"Professional Implant","active":true},{"id":"fs_67","categoryId":"FAMILY PLANNING SERVICES","name":"Patch","price":5000,"roles":["RN","LPN"],"description":"Professional Patch","active":true},{"id":"fs_68","categoryId":"FAMILY PLANNING SERVICES","name":"Barrier Methods","price":5000,"roles":["RN","LPN"],"description":"Professional Barrier Methods","active":true},{"id":"fs_69","categoryId":"FAMILY PLANNING SERVICES","name":"Implant Removal","price":5000,"roles":["RN","LPN"],"description":"Professional Implant Removal","active":true},{"id":"fs_70","categoryId":"FAMILY PLANNING SERVICES","name":"Other Family Planning Care","price":5000,"roles":["RN","LPN"],"description":"Professional Other Family Planning Care","active":true},{"id":"fs_71","categoryId":"GENERAL HEALTH EDUCATION","name":"General Health Education","price":5000,"roles":["RN","LPN"],"description":"Professional General Health Education","active":true},{"id":"fs_72","categoryId":"ORAL HEALTH","name":"Oral Health","price":5000,"roles":["RN","LPN"],"description":"Professional Oral Health","active":true},{"id":"fs_73","categoryId":"EYE CARE","name":"Eye Care","price":5000,"roles":["RN","LPN"],"description":"Professional Eye Care","active":true},{"id":"fs_74","categoryId":"EAR, NOSE AND THROAT (ENT) CARE","name":"Ear, Nose and Throat (ENT) Care","price":5000,"roles":["RN","LPN"],"description":"Professional Ear, Nose and Throat (ENT) Care","active":true},{"id":"fs_75","categoryId":"SKIN CARE","name":"Skin Care","price":5000,"roles":["RN","LPN"],"description":"Professional Skin Care","active":true},{"id":"fs_76","categoryId":"ORTHOPEDIC CARE","name":"Orthopedic Care","price":5000,"roles":["RN","LPN"],"description":"Professional Orthopedic Care","active":true},{"id":"fs_77","categoryId":"MENTAL HEALTH","name":"Mental Health Support","price":5000,"roles":["RN","LPN"],"description":"Professional Mental Health Support","active":true},{"id":"fs_78","categoryId":"PEDIATRIC - KIDS HEALTH","name":"Pediatric / Kids Health","price":5000,"roles":["RN","LPN"],"description":"Professional Pediatric / Kids Health","active":true},{"id":"fs_79","categoryId":"AMBULANCE SERVICE","name":"Request Ambulance","price":5000,"roles":["RN","LPN"],"description":"Professional Request Ambulance","active":true}]).filter(s => s.categoryId === selectedCategory.name).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No services available in this category yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        
        {step === 'physician_booking_form' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Book Physician', 'Book Physician')} onBack={() => setStep('home')} />
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Physician Care', 'Physician Care')}</h2>
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <p className="text-blue-900 font-bold">{t('Service Fee', 'Service Fee')}</p>
                    <p className="text-blue-700 text-sm">{t('Fixed rate', 'Fixed rate')}</p>
                  </div>
                  <div className="text-xl font-black text-blue-900">₦15,000</div>
                </div>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); setStep('physician_payment'); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Full Name')}</label>
                  <input required type="text" value={physicianForm.name} onChange={e => setPhysicianForm({...physicianForm, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Phone Number')}</label>
                  <input required type="tel" value={physicianForm.phone} onChange={e => setPhysicianForm({...physicianForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Email Address')}</label>
                  <input required type="email" value={physicianForm.email} onChange={e => setPhysicianForm({...physicianForm, email: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Current Address')}</label>
                  <input required type="text" value={physicianForm.address} onChange={e => setPhysicianForm({...physicianForm, address: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                  {!location && (
                    <button type="button" onClick={handleUseCurrentLocation} disabled={locating} className="text-blue-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {locating ? 'Locating...' : 'Get Current Location'}
                    </button>
                  )}
                  {location && <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Location saved</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('Preferred Date')}</label>
                    <input required type="date" value={physicianForm.date} onChange={e => setPhysicianForm({...physicianForm, date: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('Preferred Time')}</label>
                    <input required type="time" value={physicianForm.time} onChange={e => setPhysicianForm({...physicianForm, time: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Reason for booking')}</label>
                  <textarea required value={physicianForm.reason} onChange={e => setPhysicianForm({...physicianForm, reason: e.target.value})} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" placeholder={t('Please describe your symptoms or reason for consulting a physician', 'Please describe your symptoms...')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Additional notes (Optional)')}</label>
                  <textarea value={physicianForm.notes} onChange={e => setPhysicianForm({...physicianForm, notes: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                </div>
                
                <div className="pt-4 pb-12">
                  <button type="submit" className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 transition-colors">
                    {t('Continue to Review', 'Continue to Review')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 'physician_payment' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Review & Pay', 'Review & Pay')} onBack={() => {
              if (physicianPaymentStatus !== 'processing') setStep('physician_booking_form');
            }} />
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('Booking Summary')}</h2>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-bold">{t('Service')}</p>
                  <p className="font-medium text-gray-900">{t('Physician Care', 'Physician Care')}</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 font-bold">{t('Client Name')}</p>
                  <p className="font-medium text-gray-900">{physicianForm.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold">{t('Phone')}</p>
                    <p className="font-medium text-gray-900">{physicianForm.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">{t('Email')}</p>
                    <p className="font-medium text-gray-900 truncate">{physicianForm.email}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 font-bold">{t('Address')}</p>
                  <p className="font-medium text-gray-900">{physicianForm.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold">{t('Date')}</p>
                    <p className="font-medium text-gray-900">{physicianForm.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">{t('Time')}</p>
                    <p className="font-medium text-gray-900">{physicianForm.time}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 font-bold">{t('Reason')}</p>
                  <p className="font-medium text-gray-900">{physicianForm.reason}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-900 font-bold">{t('Service Fee')}</span>
                  <span className="text-blue-900 font-black text-xl">₦15,000</span>
                </div>
                <p className="text-xs text-blue-700">{t('Fixed standard physician consultation fee')}</p>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><ActivitySquare className="w-5 h-5 text-blue-900"/> Select Payment Method</h3>
                
                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", physicianPaymentMethod === 'test' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPhysicianPaymentMethod('test')}
                >
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-teal-600" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Test Payment</p>
                      <p className="text-xs text-teal-700 font-semibold">Demo Payment — No real money will be charged.</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", physicianPaymentMethod === 'test' ? "border-blue-900" : "border-gray-300")}>
                    {physicianPaymentMethod === 'test' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>

                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", physicianPaymentMethod === 'card' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPhysicianPaymentMethod('card')}
                >
                  <div className="flex items-center gap-4">
                    <ActivitySquare className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Credit/Debit Card</p>
                      <p className="text-xs text-gray-500">Pay securely with your card</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", physicianPaymentMethod === 'card' ? "border-blue-900" : "border-gray-300")}>
                    {physicianPaymentMethod === 'card' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>
              </div>

              <form onSubmit={confirmPhysicianBooking} className="relative">
                {physicianPaymentStatus === 'processing' && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mb-2"></div>
                    <p className="font-bold text-blue-900 text-sm">Processing Payment...</p>
                  </div>
                )}
                {physicianPaymentStatus === 'failed' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-bold text-center">
                    Payment failed. Please try again.
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={physicianPaymentStatus === 'processing' || physicianPaymentStatus === 'success'}
                  className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {t('Pay ₦15,000', 'Pay ₦15,000')} <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-4"><ShieldCheck className="w-3 h-3"/> Secured System</p>
              </form>
            </div>
          </div>
        )}

        {step === 'physician_success' && (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8 text-center animate-in zoom-in duration-500">
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center shadow-lg z-10">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 border-2 border-teal-200 rounded-full animate-ping opacity-30"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-blue-900 mb-2">{t('Physician Booking Submitted Successfully', 'Physician Booking Submitted Successfully')}</h2>
            
            <div className="bg-white w-full rounded-2xl p-5 shadow-sm border border-gray-100 my-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">{t('Amount Paid')}</span>
                <span className="font-bold text-gray-900">₦15,000</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">{t('Payment Status')}</span>
                <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-xs">PAID</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-sm">{t('Booking Status')}</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{t('Pending Admin Processing', 'Pending Admin Processing')}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-8">
              {t('Our admin team will contact you shortly via phone or email to arrange your physician service.', 'Our admin team will contact you shortly via phone or email to arrange your physician service.')}
            </p>
            
            <div className="space-y-3 w-full max-w-xs">
              <button 
                onClick={() => setStep('bookings')}
                className="w-full bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow hover:bg-blue-800 transition-colors"
              >
                {t('View My Booking', 'View My Booking')}
              </button>
              <button 
                onClick={() => setStep('home')}
                className="w-full bg-white text-blue-900 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t('Return to Home')}
              </button>
            </div>
          </div>
        )}

{step === 'physician_categories' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Specialists" onBack={() => setStep('home')} />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Find a Physician</h2>
              <p className="text-gray-500 text-sm mb-6">Select a specialist category to view available doctors.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {PHYSICIAN_SPECIALTIES.map(specialty => {
                  const Icon = specialty.icon;
                  return (
                    <button 
                      key={specialty.id}
                      onClick={async () => {
                        setSelectedSpecialty(specialty.name);
                        setStep('physician_list');
                        
                        // Load physicians
                        const providersRef = collection(db, 'providers');
                        const q = query(
                          providersRef,
                          where('type', '==', 'physician'),
                          where('specialty', '==', specialty.name),
                          where('available', '==', true)
                        );
                        const snap = await getDocs(q);
                        const matched: (Provider & { distanceKm: number | null })[] = [];
                        snap.forEach(doc => {
                          const p = doc.data() as Provider;
                          
                          // Remove strict city-name spelling checks, use radius instead
                          // if (p.serviceArea && !p.serviceArea.toLowerCase().includes('kano')) return;
                          
                          let distanceKm: number | null = null;
                          if (location && location.lat && location.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) {
                             distanceKm = calculateDistance(location.lat, location.lng, p.latitude, p.longitude);
                             
                             // Only show providers within 50km radius
                             if (distanceKm > 50) {
                               console.log(`[Client GPS] Ignoring ${p.name} - too far (${distanceKm.toFixed(2)} km)`);
                               return;
                             }
                          }
                          
                          if (!p.verified || p.applicationStatus !== 'approved') {
                            console.log(`[Client] Ignoring ${p.name} - unverified`);
                            return;
                          }
                          
                          if (!p.isBusy) {
                            matched.push({ ...p, id: doc.id, distanceKm });
                          }
                        });
                        
                        matched.sort((a, b) => {
                          if (a.distanceKm === null) return 1;
                          if (b.distanceKm === null) return -1;
                          return a.distanceKm - b.distanceKm;
                        });
                        
                        setProviders(matched);
                      }}
                      className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-purple-200 hover:shadow-md transition-all shadow-sm flex flex-col"
                    >
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                        <Icon className="w-6 h-6 text-purple-900" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{specialty.name}</h4>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 'physician_list' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={selectedSpecialty || 'Physicians'} onBack={() => setStep('physician_categories')} />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Doctors</h2>
              <p className="text-gray-500 text-sm mb-6">Select a doctor to view their profile and book an appointment.</p>
              
              <div className="space-y-4">
                {providers.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
                    <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 text-lg mb-2">No doctors found</h3>
                    <p className="text-gray-500 text-sm">We couldn't find any available {selectedSpecialty}s at this moment. Please try again later.</p>
                  </div>
                ) : (
                  providers.map(provider => (
                    <div key={provider.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                          <UserCircle className="w-10 h-10 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{provider.name}</h3>
                              <p className="text-purple-700 text-sm font-medium">{provider.specialty}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="font-bold text-sm text-yellow-700">{provider.rating?.toFixed(1) || '5.0'}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <ShieldCheck className="w-4 h-4 text-purple-900" />
                              <span>{provider.experienceYears || '5+'} Years Experience</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="w-4 h-4 text-purple-900" />
                              <span>{provider.clinicLocation || 'Remote Consultation'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <ActivitySquare className="w-4 h-4 text-purple-900" />
                              <span className="font-semibold text-gray-900">₦{(provider.consultationFee || 15000).toLocaleString()} Consultation</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => { setSelectedProvider(provider); setStep('physician_profile'); }}
                              className="flex-1 border border-purple-200 text-purple-900 font-bold py-2.5 rounded-xl hover:bg-purple-50 transition-colors text-sm"
                            >
                              View Profile
                            </button>
                            <button 
                              onClick={() => { setSelectedProvider(provider); setStep('physician_profile'); }}
                              className="flex-1 bg-purple-900 text-white font-bold py-2.5 rounded-xl hover:bg-purple-800 transition-colors text-sm shadow-md"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'physician_profile' && selectedProvider && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300 relative overflow-y-auto pb-32">
            <TopNav title="Doctor Profile" onBack={() => setStep('physician_list')} />
            
            <div className="w-full h-48 bg-purple-900 relative flex items-end p-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <div className="relative z-20 flex gap-4 w-full">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg border-2 border-purple-200">
                  <UserCircle className="w-14 h-14 text-purple-900" />
                </div>
                <div className="pb-1">
                  <h2 className="text-white text-2xl font-bold mb-1">{selectedProvider.name}</h2>
                  <span className="bg-purple-200 text-purple-900 text-xs font-bold px-3 py-1 rounded-lg">
                    {selectedProvider.specialty}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                  <h3 className="font-bold text-gray-900 text-lg">{selectedProvider.experienceYears || '10+'} Years</h3>
                  <p className="text-xs text-gray-500 font-medium leading-tight">Experience</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1">
                    {selectedProvider.rating?.toFixed(1) || '5.0'} <Star className="w-4 h-4 text-yellow-500 fill-current"/>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-tight">Rating</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="text-purple-900 w-5 h-5"/> Location</h3>
                <p className="text-sm text-gray-600 font-medium">{selectedProvider.clinicLocation || 'Remote Consultation only'}</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Book Appointment</h3>
                
                <label className="block text-sm font-bold text-gray-700 mb-2">Consultation Type</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => setConsultationType('in-person')} className={`py-3 rounded-xl border text-sm font-bold ${consultationType === 'in-person' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    In-Person
                  </button>
                  <button onClick={() => setConsultationType('online')} className={`py-3 rounded-xl border text-sm font-bold ${consultationType === 'online' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    Online Video
                  </button>
                </div>

                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input type="date" value={physicianDate} onChange={e => setPhysicianDate(e.target.value)} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-purple-400" />
                
                <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                <input type="time" value={physicianTime} onChange={e => setPhysicianTime(e.target.value)} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400" />
              </div>
            </div>

            <div className="absolute bottom-0 w-full p-6 bg-slate-50 border-t border-gray-200 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium text-sm">Consultation Fee</span>
                <span className="text-xl font-bold text-purple-900">₦{(selectedProvider.consultationFee || 15000).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => {
                  if(!physicianDate || !physicianTime) {
                    alert("Please select both a date and a time.");
                    return;
                  }
                  setSelectedService({
                    id: 999,
                    name: `Physician Consultation (${consultationType})`,
                    icon: UserCircle,
                    desc: `Consultation with ${selectedProvider.name} - ${selectedProvider.specialty}`,
                    price: selectedProvider.consultationFee || 15000,
                    displayPrice: `₦${(selectedProvider.consultationFee || 15000).toLocaleString()}`,
                    duration: '45 mins'
                  });
                  setStep('booking_summary');
                }}
                className="w-full bg-purple-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-800 flex items-center justify-center gap-2 transition-colors"
              >
                Continue to Booking
              </button>
            </div>
          </div>
        )}

        {step === 'service_details' && selectedService && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Nurse To You')} onBack={() => setStep('all_services')} />
            
            {/* Hero Image Placeholder */}
            <div className="w-full h-48 bg-blue-900 relative flex items-end p-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <div className="relative z-20 w-full">
                <h2 className="text-white text-3xl font-bold mb-2">{selectedService.name}</h2>
                <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                  <ShieldCheck className="w-4 h-4"/> Verified Service
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed">{selectedService.description || selectedService.desc}</p>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                  <ActivitySquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">{t('Estimated Price')}</p>
                  <p className="text-blue-900 font-bold text-xl">₦{selectedService.price?.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">{t('Required Qualifications')}</p>
                  <p className="text-blue-900 font-bold text-sm">{(selectedService.roles || []).join(', ') || 'Authorized Healthcare Provider'}</p>
                </div>
              </div>
              
              <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 flex gap-3">
                <ActivitySquare className="w-5 h-5 text-teal-600 shrink-0" />
                <p className="text-teal-900 text-sm leading-relaxed">This service is provided only by appropriately qualified and authorized healthcare professionals.</p>
              </div>
            </div>
            
            <div className="mt-auto p-6 bg-slate-50 border-t border-gray-200">
              <button 
                onClick={() => setStep('location')}
                className="w-full bg-blue-900 text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-800"
              >
                <ActivitySquare className="w-5 h-5"/> {t('Book This Service')}
              </button>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300 relative">
            <TopNav title={t('Set Your Location')} onBack={() => setStep('service_details')} />
            
            <div className="h-48 md:h-64 relative z-0 shrink-0">
              <MapContainer 
                center={location ? [location.lat, location.lng] : [DEFAULT_KANO_CENTER.lat, DEFAULT_KANO_CENTER.lng]} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {location && (
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>{address || 'Selected Location'}</Popup>
                  </Marker>
                )}
              </MapContainer>
              
              <button 
                onClick={handleUseCurrentLocation}
                title="Use Live GPS"
                className="absolute bottom-4 right-4 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-900 z-[400] border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <LocateFixed className="w-5 h-5 text-teal-600" />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-50 border-t border-gray-200 p-5 z-10 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-900" /> Kano State Service Coverage
                </span>
                {locationNotice && (
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {locationNotice}
                  </span>
                )}
              </div>

              {/* GPS button */}
              <button 
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="w-full bg-white border border-teal-500 text-teal-700 font-semibold py-2.5 rounded-xl mb-3 flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors shadow-sm text-sm"
              >
                <LocateFixed className={cn("w-4 h-4 text-teal-600", locating && "animate-spin")} /> 
                {locating ? 'Detecting GPS...' : 'Use My Live GPS Location'}
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">OR SELECT IN KANO</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Metropolitan Kano Quick Chips */}
              <div className="mb-3">
                <p className="text-[11px] font-bold text-gray-700 mb-1.5">Kano Metropolitan Areas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {KANO_METROPOLITAN_AREAS.map(area => {
                    const isSelected = selectedKanoAreaId === area.id || address.toLowerCase().includes(area.name.toLowerCase());
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => {
                          setSelectedKanoAreaId(area.id);
                          setAddress(`${area.name}, Kano State`);
                          setLocation({ lat: area.lat, lng: area.lng });
                          setLocationNotice(`${area.name} selected ✓`);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all",
                          isSelected
                            ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-900 hover:bg-blue-50"
                        )}
                      >
                        {area.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Other Kano LGAs Dropdown */}
              <div className="mb-3">
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Other Kano State LGAs:</label>
                <select
                  value={selectedKanoAreaId}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    setSelectedKanoAreaId(chosenId);
                    const found = ALL_KANO_AREAS.find(a => a.id === chosenId);
                    if (found) {
                      setAddress(`${found.name}, Kano State`);
                      setLocation({ lat: found.lat, lng: found.lng });
                      setLocationNotice(`${found.name} selected ✓`);
                    }
                  }}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 font-medium outline-none focus:border-blue-900 shadow-sm"
                >
                  <option value="">-- Choose other Kano LGA --</option>
                  {OTHER_KANO_LGAS.map(lga => (
                    <option key={lga.id} value={lga.id}>{lga.name}</option>
                  ))}
                </select>
              </div>

              {/* Specific Street Address / Landmark input */}
              <div className="bg-white border border-gray-300 rounded-xl p-2.5 mb-4 focus-within:border-blue-900 shadow-sm">
                <span className="text-[11px] font-bold text-gray-900 block mb-1">Street Address or Landmark (Optional Details)</span>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 15 Zoo Road, Tarauni, Kano"
                  className="w-full outline-none text-gray-800 text-xs bg-transparent"
                />
              </div>

              {/* Confirm Location button */}
              <button 
                onClick={findProviders}
                disabled={!location && !address.trim()}
                className="w-full bg-blue-900 text-white font-semibold py-3.5 rounded-xl shadow-lg disabled:opacity-50 disabled:shadow-none hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" /> Find Available Providers in Kano
              </button>
            </div>
          </div>
        )}

        {step === 'matching' && (
          <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-8 text-center animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Nurse To You</h2>
            <p className="text-gray-600 font-medium mb-12">Automated Matching</p>
            
            <div className="relative w-64 h-64 mb-12">
              <div className="absolute inset-0 border-[1px] border-teal-200 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-4 border-[1px] border-teal-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-12 border-[1px] border-teal-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-0 bg-teal-50 rounded-full flex items-center justify-center shadow-inner">
                <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center text-white shadow-xl z-10 relative">
                  <ActivitySquare className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-blue-900 mb-6">Searching for providers...</h3>
            
            <div className="flex gap-3 mb-8">
              <span className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                <MapPin className="w-4 h-4"/> Kano Central
              </span>
              <span className="bg-teal-200 border border-teal-300 text-teal-900 text-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 font-medium">
                <ActivitySquare className="w-4 h-4"/> {selectedService?.name}
              </span>
            </div>
            
            <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-left">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Verifying Criteria</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-900" />
                    <span className="font-semibold text-gray-900 text-sm">Professional Credentials</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-gray-900 text-sm">Real-time Availability</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <LocateFixed className="w-5 h-5 text-red-800" />
                    <span className="font-semibold text-gray-900 text-sm">Proximity</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
              </div>
            </div>
            
            <button onClick={() => setStep('home')} className="mt-8 text-red-600 font-bold text-sm">Cancel Search</button>
          </div>
        )}

        {step === 'results' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Nurse To You')} onBack={() => setStep('location')} />
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Available Nurses for {selectedService?.name}</h2>
              <p className="text-gray-500 text-sm flex items-center gap-1 mb-6">
                <MapPin className="w-4 h-4"/> Showing verified and available providers in Kano State
              </p>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                <button className="bg-teal-200 text-teal-900 font-semibold px-4 py-2 rounded-full text-sm shrink-0 flex items-center gap-1 border border-teal-300">
                  <CheckCircle className="w-4 h-4"/> Qualified Only
                </button>
                <button className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-full text-sm shrink-0">Nearest</button>
                <button className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-full text-sm shrink-0">Top Rated</button>
              </div>
              
              <div className="space-y-4">
                {providers.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm mt-8">
                    <ActivitySquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 leading-tight mb-2">No Available Providers Right Now</h3>
                    <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                      All approved providers for {selectedService?.name} in Kano State are currently offline or attending to other patients.
                    </p>
                    <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                      <button 
                        onClick={() => setStep('location')}
                        className="w-full py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm"
                      >
                        Change Service Location
                      </button>
                      <button 
                        onClick={() => setStep('home')}
                        className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Choose Another Service
                      </button>
                    </div>
                  </div>
                ) : (
                  <>

                    {providers.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative">
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex shrink-0 items-center justify-center relative overflow-hidden">
                          <UserCircle className="w-12 h-12 text-blue-900 mt-2" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            {p.name}
                            {p.verified && <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</span>}
                          </h3>
                          <p className="text-gray-600 text-sm mb-1">{p.professionalRole} • {selectedService?.name}</p>
                          <p className="text-teal-600 text-xs font-bold mb-2">Available</p>
                          <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-700">
                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> {p.rating.toFixed(1)} Rating</span>
                            {p.distanceKm !== null ? (
                              <span className="flex items-center gap-1"><Navigation className="w-4 h-4 text-gray-400"/> {p.distanceKm.toFixed(1)}km away</span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-gray-600"><Navigation className="w-4 h-4 text-teal-600 shrink-0"/> Kano State Provider</span>
                            )}
                            {p.distanceKm !== null ? (
                              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400"/> ~{Math.max(10, Math.round(p.distanceKm * 4))} mins arrival</span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-gray-600"><Clock className="w-4 h-4 text-gray-400"/> Kano State Coverage</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                        <button 
                          onClick={() => { setSelectedProvider(p); setStep('provider_profile'); }}
                          className="flex-1 bg-white border border-teal-500 text-teal-600 font-bold py-2.5 rounded-xl text-sm hover:bg-teal-50 transition-colors"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => { setSelectedProvider(p); setStep('booking_summary'); }}
                          className="flex-1 bg-blue-900 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:bg-blue-800 transition-colors"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                  </>
                )}
              </div>
            </div>
            <BottomNav />
          </div>
        )}

        {step === 'provider_profile' && selectedProvider && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Nurse To You')} onBack={() => setStep('results')} />
            
            <div className="p-6 pb-24">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                  <UserCircle className="w-20 h-20 text-blue-900 mt-4" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedProvider.name}</h2>
                <p className="text-gray-600 text-sm mb-3">{selectedProvider.professionalRole}</p>
                {selectedProvider.verified && (
                  <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                    <ShieldCheck className="w-4 h-4"/> Verified
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-2">
                    <ActivitySquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">8 Years</h3>
                  <p className="text-xs text-gray-600 font-medium leading-tight">Experience in<br/>community health</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 fill-orange-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedProvider.rating.toFixed(1)} <span className="text-xs text-gray-500">/ 5.0</span></h3>
                  <p className="text-xs text-gray-600 font-medium leading-tight">(124 reviews)</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ActivitySquare className="text-blue-900 w-5 h-5"/> Qualified Services</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.services.map(s => (
                    <span key={s} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-teal-600"/> {s}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Clock className="text-blue-900 w-5 h-5"/> Availability</h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Monday - Friday</h4>
                    <p className="text-gray-600 text-sm">8:00 AM - 6:00 PM</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-200 text-teal-800 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 w-full p-6 bg-slate-50 border-t border-gray-200 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => setStep('booking_summary')}
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-5 h-5"/> Book Now
              </button>
            </div>
          </div>
        )}

        {step === 'booking_summary' && selectedProvider && selectedService && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Nurse To You')} onBack={() => setStep('provider_profile')} />
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Booking Summary</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">Please review your appointment details before confirming.</p>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
                <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-5">
                  <div className="w-14 h-14 bg-blue-900 rounded-xl text-white flex items-center justify-center shrink-0">
                    <ActivitySquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedService.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCircle className="w-4 h-4"/> {selectedProvider.name}
                      {selectedProvider.verified && <span className="bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Verified</span>}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex gap-4">
                    <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs mb-1">Date</p>
                      <p className="text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs mb-1">Time</p>
                      <p className="text-gray-700">10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs mb-1">Service Location in Kano</p>
                      <p className="text-gray-700">{address || 'Kano State'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2 border-t border-gray-100">
                    <Phone className="w-5 h-5 text-teal-600 shrink-0 mt-2" />
                    <div className="flex-1">
                      <label className="font-bold text-gray-900 text-xs mb-1 block">
                        Your Contact Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="e.g. +234 801 234 5678"
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 font-medium outline-none focus:border-blue-900"
                        required
                      />
                      <p className="text-[10px] text-gray-500 mt-1">The nurse will call this number when arriving at your location.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 shadow-sm mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg"><ActivitySquare className="w-5 h-5"/> Payment Breakdown</h3>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>Service Price</span>
                  <span>{selectedService.displayPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4 border-b border-gray-200 pb-4">
                  <span>Booking Fee</span>
                  <span>₦500</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xl text-blue-900">
                  <span>Total</span>
                  <span>₦{(selectedService.price + 500).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    if (!contactPhone.trim()) {
                      alert("Please provide your contact phone number before confirming your booking.");
                      return;
                    }
                    setStep('payment');
                  }}
                  className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 transition-colors"
                >
                  Proceed to Payment
                </button>
                <button 
                  onClick={() => setStep('results')}
                  className="w-full bg-white text-teal-600 border border-teal-500 font-bold py-4 rounded-xl hover:bg-teal-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <BottomNav />
          </div>
        )}

        {step === 'payment' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Payment" onBack={() => setStep('booking_summary')} />
            
            <div className="p-6">
                            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 text-center mb-8 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Total to Pay</p>
                <h2 className="text-4xl font-black text-blue-900">₦{(selectedService.price + 500).toLocaleString()}</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><ActivitySquare className="w-5 h-5 text-blue-900"/> Select Payment Method</h3>
                
                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", paymentMethod === 'test' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPaymentMethod('test')}
                >
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-teal-600" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Test Payment</p>
                      <p className="text-xs text-teal-700 font-semibold">Demo Payment — No real money will be charged.</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", paymentMethod === 'test' ? "border-blue-900" : "border-gray-300")}>
                    {paymentMethod === 'test' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>

                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", paymentMethod === 'card' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center gap-4">
                    <ActivitySquare className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Credit/Debit Card</p>
                      <p className="text-xs text-gray-500">Pay securely with your card</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", paymentMethod === 'card' ? "border-blue-900" : "border-gray-300")}>
                    {paymentMethod === 'card' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>
              </div>
              
              {bookingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2">
                  <ActivitySquare className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{bookingError}</span>
                </div>
              )}

              <div className="text-center mb-8 pb-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3"/> Secured System</p>
              </div>
              
              <button 
                onClick={confirmBooking}
                disabled={isBooking}
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isBooking ? 'Processing Booking...' : 'Pay Now'} <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8 text-center animate-in zoom-in duration-500">
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 border-2 border-teal-200 rounded-full animate-ping opacity-30"></div>
            </div>
            
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-700 font-medium mb-8">Booking ID: <span className="font-bold">{bookingNumber}</span></p>
            
            <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-8 text-left">
              <div className="flex gap-4 mb-5 border-b border-gray-100 pb-5">
                <div className="w-14 h-14 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <UserCircle className="w-10 h-10 text-blue-900 mt-2" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {selectedProvider?.name}
                    <span className="bg-teal-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Verified</span>
                  </h3>
                  <p className="text-gray-600 text-sm flex items-center gap-1"><ActivitySquare className="w-4 h-4"/> {selectedProvider?.professionalRole}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-0.5">Scheduled for</p>
                    <p className="text-sm text-gray-700 font-medium">Today, 2:30 PM</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-0.5">Location</p>
                    <p className="text-sm text-gray-700 font-medium">Home Visit ({address || 'Kano City'})</p>
                  </div>
                </div>
                {bookedProviderPhone && (
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-lg">📞</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 mb-0.5">Contact</p>
                      <p className="text-sm text-gray-700 font-medium">{bookedProviderPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full space-y-3">
              {bookedProviderPhone && (
                <a 
                  href={`tel:${bookedProviderPhone}`}
                  className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 flex items-center justify-center gap-2 transition-colors"
                >
                  📞 {t('Call Provider')}
                </a>
              )}
              <button 
                onClick={() => setStep('bookings')}
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
              >
                <LocateFixed className="w-5 h-5" /> Track Provider
              </button>
              <button 
                onClick={() => setStep('home')}
                className="w-full bg-white text-teal-700 border border-teal-600 font-bold py-4 rounded-xl hover:bg-teal-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {step === 'bookings' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300 overflow-y-auto pb-24">
            <TopNav title="My Bookings" onBack={() => setStep('home')} />
            <div className="p-6">
              {clientBookings.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">You have no booking history.</div>
              ) : (
                <div className="space-y-4">
                  {clientBookings.map(b => (
                    <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className={`w-12 h-12 ${b.bookingType === 'physician' ? 'bg-purple-100' : 'bg-blue-100'} rounded-full flex items-center justify-center shrink-0`}>
                            <UserCircle className={`w-8 h-8 ${b.bookingType === 'physician' ? 'text-purple-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 flex items-center gap-1">
                                {b.providerName || 'Healthcare Provider'} <CheckCircle className="w-3 h-3 text-teal-500"/>
                            </h4>
                            <p className="text-gray-500 text-xs font-medium">{b.service}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                          b.status === 'REQUESTED' ? "bg-orange-100 text-orange-700" :
                          b.status === 'ACCEPTED' ? "bg-blue-100 text-blue-700" :
                          b.status === 'IN_PROGRESS' || b.status === 'ON_THE_WAY' || b.status === 'ARRIVED' ? "bg-purple-100 text-purple-700" :
                          b.status === 'COMPLETED' ? "bg-teal-100 text-teal-700" :
                          "bg-gray-100 text-gray-700"
                        )}>{b.status.replace(/_/g, ' ')}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <Calendar className="w-4 h-4 text-blue-900"/> 
                          {b.date || new Date(b.createdAt).toLocaleDateString()}
                        </div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <Clock className="w-4 h-4 text-blue-900"/> 
                          {b.time || new Date(b.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      
                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <div className="pt-3 border-t border-gray-100 mt-1 flex flex-col gap-2">
                          
                          {/* Live Tracking Section */}
                          {b.isTrackingActive ? (
                            expandedTracking === b.id ? (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex flex-col mb-2">
                                <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-blue-600 animate-pulse" />
                                      <span className="text-xs font-bold text-gray-900">Live Provider Location</span>
                                    </div>
                                    {b.lastLocationUpdate && (
                                      <span className="text-[10px] text-gray-500 ml-6">
                                        Last update: {new Date(b.lastLocationUpdate).toLocaleTimeString()}
                                      </span>
                                    )}
                                  </div>
                                  <button onClick={() => setExpandedTracking(null)} className="text-xs text-gray-500 font-medium hover:text-gray-900">Close Map</button>
                                </div>
                                <div className="h-48 w-full relative z-0">
                                  {b.providerLatitude !== undefined && b.providerLongitude !== undefined ? (
                                    <MapContainer center={[b.providerLatitude, b.providerLongitude]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                      {/* Provider Marker */}
                                      <Marker position={[b.providerLatitude, b.providerLongitude]}>
                                        <Popup>Provider's Live Location</Popup>
                                      </Marker>
                                      {/* Patient Marker */}
                                      <Marker position={[b.patientLatitude, b.patientLongitude]}>
                                        <Popup>Your Location</Popup>
                                      </Marker>
                                    </MapContainer>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">Location unavailable</div>
                                  )}
                                </div>
                                {b.providerLatitude !== undefined && b.providerLongitude !== undefined && (
                                  <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${b.providerLatitude},${b.providerLongitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 text-center bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                                  >
                                    Get Directions to Provider
                                  </a>
                                )}
                              </div>
                            ) : (
                              <button 
                                onClick={() => setExpandedTracking(b.id)}
                                className="w-full bg-blue-50 text-blue-700 border border-blue-200 font-bold py-3 rounded-xl shadow hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors text-sm mb-2"
                              >
                                <LocateFixed className="w-4 h-4 animate-pulse" /> Track Provider Live
                              </button>
                            )
                          ) : b.lastLocationUpdate ? (
                            <div className="w-full bg-slate-50 text-slate-500 border border-slate-200 font-medium py-2 rounded-lg text-xs text-center mb-2">
                              Provider location sharing has ended.
                            </div>
                          ) : null}

                          {b.providerPhone ? (
                            <>
                              <p className="text-xs text-gray-500 font-medium text-center">Provider Contact: <span className="text-gray-900">{b.providerPhone}</span></p>
                              <a 
                                href={`tel:${b.providerPhone}`}
                                className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl shadow hover:bg-teal-700 flex items-center justify-center gap-2 transition-colors text-sm"
                              >
                                📞 {t('Call Provider')}
                              </a>
                            </>
                          ) : (
                            <div className="w-full bg-gray-50 text-gray-500 border border-gray-200 font-medium py-3 rounded-xl text-sm text-center">
                              Provider contact unavailable
                            </div>
                          )}

                          {b.status === 'REQUESTED' && (
                            <button
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to cancel this booking request?")) {
                                  try {
                                    await updateDoc(doc(db, 'bookings', b.id), { status: 'CANCELLED' });
                                    if (b.providerId) {
                                      await updateDoc(doc(db, 'providers', b.providerId), {
                                        isBusy: false,
                                        currentBookingId: null
                                      });
                                    }
                                    alert("Booking request cancelled.");
                                  } catch (err: any) {
                                    alert("Error cancelling booking: " + err.message);
                                  }
                                }
                              }}
                              className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-xl text-xs hover:bg-red-100 transition-colors mt-1"
                            >
                              Cancel Booking Request
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Nurse To You')} />
            <div className="p-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-6 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                    <UserCircle className="w-20 h-20 text-blue-900 mt-4" />
                  </div>
                  <div className="absolute bottom-4 right-0 w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <ActivitySquare className="w-4 h-4" /> {/* Edit icon proxy */}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{userName}</h2>
                <p className="text-gray-500 text-sm mb-3">Patient ID: #N2Y-8492</p>
                <span className="bg-teal-300 text-teal-900 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 w-max border border-teal-400 shadow-sm">
                  <ShieldCheck className="w-4 h-4"/> Verified
                </span>
              </div>
              
              <div className="space-y-4 mb-8">
                <button className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-900">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Personal Information</h4>
                      <p className="text-xs text-gray-500">Update your details</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => setStep('auth_settings')} className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-900">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Account & Security</h4>
                      <p className="text-xs text-gray-500">Manage email login and password</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => setStep('bookings')} className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-900">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Bookings</h4>
                      <p className="text-xs text-gray-500">View appointment history</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => setStep('reports')} className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-900">
                      <ActivitySquare className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Reports</h4>
                      <p className="text-xs text-gray-500">Medical documents & summaries</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <BottomNav />
          </div>
        )}

        {step === 'reports' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Visit Summary" onBack={() => setStep('home')} />
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-4 flex gap-4 items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <UserCircle className="w-12 h-12 text-blue-900 mt-2" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2 mb-1">
                    Nurse Amina
                    <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</span>
                  </h3>
                  <p className="text-gray-600 text-sm">Attending Provider</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-4">
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Rendered</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center">
                      <ActivitySquare className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Malaria Test</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-100 mb-6"></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Results</p>
                  <span className="bg-teal-100 text-teal-900 font-bold text-lg px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-teal-200">
                    <FlaskConical className="w-5 h-5 text-teal-700"/> Negative
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3"><ActivitySquare className="w-4 h-4"/> Clinical Notes</h4>
                  <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl text-gray-700 text-sm leading-relaxed">
                    Patient advised to rest and stay hydrated.
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3"><ActivitySquare className="w-4 h-4"/> Recommendation</h4>
                  <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl text-gray-700 text-sm leading-relaxed">
                    Follow up if symptoms persist.
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors">
                <Download className="w-5 h-5" /> Download PDF Report
              </button>
            </div>
          </div>
        )}

        {step === 'auth_settings' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Security" />
            <div className="p-6">
              <AuthSettings />
            </div>
          </div>
        )}

                {step === 'menstrual_tracker' && (
          <MenstrualTracker patientId={patientId} onBack={() => setStep('home')} />
        )}
        
        {step === 'pharmacy' && (
          <PharmacyClientApp patientId={patientId} onBack={() => setStep('home')} />
        )}
      </div>
    </div>
  );
}
