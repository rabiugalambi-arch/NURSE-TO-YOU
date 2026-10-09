import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CATEGORIES = [
  "Medication & Therapy", "Wound Care", "Respiratory Care", "Health Monitoring", 
  "Urinary Care", "Gastrointestinal Care", "Physical Care & Mobility", 
  "Diagnostic Services", "Laboratory Services", "Pregnancy & Maternity Care", 
  "Family Planning Services", "General Health Education", "Oral Health", 
  "Eye Care", "ENT Care", "Skin Care", "Orthopedic Care", "Mental Health", 
  "Pediatric / Children's Health", "Physician Care", "Specialist Care", 
  "Ambulance Service", "Pharmacy Services"
];

const SERVICES = [
  { cat: "Medication & Therapy", name: "Medication Administration", desc: "Professional medication administration." },
  { cat: "Medication & Therapy", name: "Injection Administration", desc: "Safe injection administration." },
  { cat: "Medication & Therapy", name: "Intravenous (IV) Therapy", desc: "IV drip and therapy management." },
  { cat: "Medication & Therapy", name: "Transdermal Patch Care", desc: "Application and monitoring of transdermal patches." },
  { cat: "Medication & Therapy", name: "Adverse Effects Monitoring", desc: "Monitoring for medication adverse effects." },
  
  { cat: "Wound Care", name: "Dressing Procedures", desc: "Professional wound dressing." },
  { cat: "Wound Care", name: "Suture Removal", desc: "Safe removal of sutures." },
  { cat: "Wound Care", name: "Staple Removal", desc: "Safe removal of staples." },
  { cat: "Wound Care", name: "Secondary Closure Care", desc: "Management of secondary closures." },
  { cat: "Wound Care", name: "Negative Pressure Wound Therapy/Monitoring", desc: "NPWT monitoring and care." },
  { cat: "Wound Care", name: "Bed Sore/Pressure Injury Care", desc: "Treatment and care for pressure injuries." },

  { cat: "Respiratory Care", name: "Nebulizer Treatment", desc: "Administration of nebulizer treatments." },
  { cat: "Respiratory Care", name: "Asthma Care and Monitoring", desc: "Asthma management and care." },
  { cat: "Respiratory Care", name: "Respiratory Monitoring", desc: "General respiratory health monitoring." },
  { cat: "Respiratory Care", name: "Oxygen Therapy", desc: "Oxygen administration and monitoring." },

  { cat: "Health Monitoring", name: "Vital Signs Monitoring", desc: "BP, HR, Temp, RR, SpO2 monitoring." },
  { cat: "Health Monitoring", name: "Blood Glucose Monitoring", desc: "Blood sugar checking." },
  { cat: "Health Monitoring", name: "Weight Measurement", desc: "Weight tracking and monitoring." },
  { cat: "Health Monitoring", name: "Exercise Guidance", desc: "Professional exercise support." },
  { cat: "Health Monitoring", name: "Diet/Nutrition Guidance", desc: "Basic nutrition education." },

  { cat: "Urinary Care", name: "Catheterization", desc: "Insertion and management of catheters." },
  { cat: "Urinary Care", name: "Catheter Care", desc: "Cleaning and maintenance of catheters." },
  { cat: "Urinary Care", name: "Urinary Irrigation", desc: "Bladder and urinary irrigation." },
  { cat: "Urinary Care", name: "Urine Testing", desc: "Basic urinalysis." },

  { cat: "Gastrointestinal Care", name: "Ostomy and Stoma Care", desc: "Care for ostomies and stomas." },
  { cat: "Gastrointestinal Care", name: "Colostomy Bag Care", desc: "Changing and managing colostomy bags." },
  { cat: "Gastrointestinal Care", name: "Abdominal Skin Care", desc: "Skin care around abdominal stomas." },
  { cat: "Gastrointestinal Care", name: "Tube Feeding", desc: "Administration of tube feedings." },
  { cat: "Gastrointestinal Care", name: "NG Tube Insertion and Care", desc: "Nasogastric tube management." },
  { cat: "Gastrointestinal Care", name: "Enema Care", desc: "Administration of enemas." },

  { cat: "Physical Care & Mobility", name: "Mobilization", desc: "Assistance with movement." },
  { cat: "Physical Care & Mobility", name: "Ambulatory Care", desc: "Assistance with walking." },
  { cat: "Physical Care & Mobility", name: "Skeletal Traction Care", desc: "Monitoring skeletal traction." },
  { cat: "Physical Care & Mobility", name: "Cast and Splint Care", desc: "Care for casts and splints." },
  { cat: "Physical Care & Mobility", name: "Safe Exercise/Physical Activity Support", desc: "Support for physical activity." },

  { cat: "Diagnostic Services", name: "Specimen Collection", desc: "Collection of various specimens." },
  { cat: "Diagnostic Services", name: "Urinalysis", desc: "Urine testing and analysis." },
  { cat: "Diagnostic Services", name: "Pregnancy Testing", desc: "Pregnancy tests." },
  { cat: "Diagnostic Services", name: "Malaria Testing", desc: "Rapid malaria tests." },
  { cat: "Diagnostic Services", name: "Rapid Diagnostic Tests (RDTs)", desc: "Various RDTs." },
  { cat: "Diagnostic Services", name: "Ultrasound Services", desc: "Diagnostic ultrasound (Subject to availability)." },
  { cat: "Diagnostic Services", name: "X-Ray Services", desc: "Diagnostic X-Ray (Subject to availability)." },

  { cat: "Laboratory Services", name: "Fasting Blood Sugar (FBS)", desc: "FBS screening." },
  { cat: "Laboratory Services", name: "Random Blood Sugar (RBS)", desc: "RBS screening." },
  { cat: "Laboratory Services", name: "H. pylori Testing", desc: "H. pylori screening." },
  { cat: "Laboratory Services", name: "HIV/Retroviral Screening", desc: "Confidential HIV screening." },
  { cat: "Laboratory Services", name: "Hepatitis A Screening", desc: "Hep A screening." },
  { cat: "Laboratory Services", name: "Hepatitis B Screening", desc: "Hep B screening." },
  { cat: "Laboratory Services", name: "Hepatitis C Screening", desc: "Hep C screening." },
  { cat: "Laboratory Services", name: "Gonorrhea Screening", desc: "Gonorrhea screening." },
  { cat: "Laboratory Services", name: "Syphilis Screening", desc: "Syphilis screening." },
  { cat: "Laboratory Services", name: "Full Blood Count (FBC)", desc: "FBC testing." },
  { cat: "Laboratory Services", name: "Blood Grouping and Rhesus (Rh)", desc: "Blood grouping tests." },
  { cat: "Laboratory Services", name: "Electrolytes, Urea and Creatinine (E/U/Cr)", desc: "E/U/Cr testing." },
  { cat: "Laboratory Services", name: "Kidney Function Test (KFT)", desc: "KFT testing." },
  { cat: "Laboratory Services", name: "Liver Function Test (LFT)", desc: "LFT testing." },
  { cat: "Laboratory Services", name: "Sputum Collection", desc: "Sputum specimen collection." },

  { cat: "Pregnancy & Maternity Care", name: "Pregnancy Testing", desc: "Pregnancy testing." },
  { cat: "Pregnancy & Maternity Care", name: "Antenatal Care", desc: "Antenatal monitoring." },
  { cat: "Pregnancy & Maternity Care", name: "Delivery Care", desc: "Delivery support by midwives." },
  { cat: "Pregnancy & Maternity Care", name: "Postpartum Care", desc: "Postpartum support." },
  { cat: "Pregnancy & Maternity Care", name: "Elective Caesarean Section (CS) Support/Referral", desc: "CS planning and referral." },
  { cat: "Pregnancy & Maternity Care", name: "Emergency Caesarean Section Referral/Coordination", desc: "Emergency CS coordination." },
  { cat: "Pregnancy & Maternity Care", name: "Caesarean Section Wound Care", desc: "Post-CS wound management." },

  { cat: "Family Planning Services", name: "Family Planning Health Education", desc: "Education on family planning." },
  { cat: "Family Planning Services", name: "Family Planning Decision-Making Support", desc: "Support in choosing methods." },
  { cat: "Family Planning Services", name: "Oral Contraceptive Pills", desc: "Oral contraceptives." },
  { cat: "Family Planning Services", name: "Injectable Contraception", desc: "Injectable contraceptives." },
  { cat: "Family Planning Services", name: "Intrauterine Device (IUD)", desc: "IUD consultation and referral." },
  { cat: "Family Planning Services", name: "Contraceptive Implant", desc: "Implant consultation and referral." },
  { cat: "Family Planning Services", name: "Contraceptive Patch", desc: "Contraceptive patches." },
  { cat: "Family Planning Services", name: "Barrier Methods", desc: "Condoms and barrier methods." },
  { cat: "Family Planning Services", name: "Implant Removal", desc: "Removal of contraceptive implants." },
  { cat: "Family Planning Services", name: "Other Family Planning Services", desc: "Other related services." },

  { cat: "General Health Education", name: "General Health Education", desc: "Basic health education." },
  { cat: "General Health Education", name: "Healthy Lifestyle Education", desc: "Lifestyle and wellness." },
  { cat: "General Health Education", name: "Disease Prevention Education", desc: "Preventive care." },
  { cat: "General Health Education", name: "Medication Education", desc: "Understanding medications." },
  { cat: "General Health Education", name: "Nutrition Education", desc: "Dietary education." },

  { cat: "Oral Health", name: "Oral Health Education", desc: "Basic oral hygiene education." },
  { cat: "Oral Health", name: "Basic Oral Health Assessment", desc: "Initial oral assessment." },
  { cat: "Oral Health", name: "Dental Care Referral", desc: "Referral to dentists." },

  { cat: "Eye Care", name: "Basic Eye Health Assessment", desc: "Initial eye assessment." },
  { cat: "Eye Care", name: "Eye Health Education", desc: "Eye care education." },
  { cat: "Eye Care", name: "Vision Screening where available", desc: "Basic vision screening." },
  { cat: "Eye Care", name: "Specialist Eye Care Referral", desc: "Referral to ophthalmologists." },

  { cat: "ENT Care", name: "Basic ENT Assessment", desc: "Initial ENT assessment." },
  { cat: "ENT Care", name: "Ear Care", desc: "Basic ear care." },
  { cat: "ENT Care", name: "Nose Care", desc: "Basic nose care." },
  { cat: "ENT Care", name: "Throat Care", desc: "Basic throat care." },
  { cat: "ENT Care", name: "ENT Specialist Referral", desc: "Referral to ENT specialists." },

  { cat: "Skin Care", name: "Basic Skin Health Assessment", desc: "Skin health checks." },
  { cat: "Skin Care", name: "Skin/Wound Care", desc: "Basic skin and wound management." },
  { cat: "Skin Care", name: "Pressure Injury Prevention", desc: "Prevention of bed sores." },
  { cat: "Skin Care", name: "Dermatology Referral", desc: "Referral to dermatologists." },

  { cat: "Orthopedic Care", name: "Basic Musculoskeletal Assessment", desc: "Joint and bone assessment." },
  { cat: "Orthopedic Care", name: "Mobility Support", desc: "Assistance with movement." },
  { cat: "Orthopedic Care", name: "Cast and Splint Care", desc: "Care for casts." },
  { cat: "Orthopedic Care", name: "Orthopedic Care Coordination", desc: "Coordination of ortho care." },
  { cat: "Orthopedic Care", name: "Orthopedic Specialist Referral", desc: "Referral to orthopedists." },

  { cat: "Mental Health", name: "Mental Health Education", desc: "Education on mental well-being." },
  { cat: "Mental Health", name: "Basic Mental Health Support", desc: "Basic emotional support." },
  { cat: "Mental Health", name: "Mental Health Screening where appropriate", desc: "Basic screening." },
  { cat: "Mental Health", name: "Mental Health Professional Referral", desc: "Referral to therapists/psychiatrists." },
  { cat: "Mental Health", name: "Emergency Mental Health Referral", desc: "Emergency referral." },

  { cat: "Pediatric / Children's Health", name: "Children's Health Assessment", desc: "Pediatric assessment." },
  { cat: "Pediatric / Children's Health", name: "Child Vital Signs Monitoring", desc: "Vitals for children." },
  { cat: "Pediatric / Children's Health", name: "Growth/Weight Monitoring", desc: "Tracking child growth." },
  { cat: "Pediatric / Children's Health", name: "Medication Support", desc: "Pediatric medication administration." },
  { cat: "Pediatric / Children's Health", name: "Child Health Education", desc: "Education for parents." },
  { cat: "Pediatric / Children's Health", name: "Pediatric Referral", desc: "Referral to pediatricians." }
];

async function seed() {
  const catsRef = collection(db, 'serviceCategories');
  const existingCats = await getDocs(catsRef);
  
  if (existingCats.empty) {
    console.log("Seeding categories...");
    const batch = writeBatch(db);
    CATEGORIES.forEach(cat => {
      batch.set(doc(catsRef, cat), { name: cat, active: true });
    });
    await batch.commit();
  }

  const servRef = collection(db, 'services');
  const existingServs = await getDocs(servRef);
  if (existingServs.empty) {
    console.log("Seeding services...");
    const batch = writeBatch(db);
    SERVICES.forEach(s => {
      const d = doc(servRef);
      batch.set(d, {
        categoryId: s.cat,
        name: s.name,
        description: s.desc,
        price: 5000,
        roles: ['RN', 'LPN'],
        active: true
      });
    });
    await batch.commit();
  }
  console.log("Done");
  process.exit(0);
}

seed().catch(console.error);
