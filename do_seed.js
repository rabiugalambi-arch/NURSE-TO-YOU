
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const exactCategories = ["MEDICATION","WOUND CARE","RESPIRATORY CARE","HEALTH MONITORING","URINARY CARE","GASTRO CARE","PHYSICAL CARE","DIAGNOSTIC CARE","OTHER LABORATORY SERVICES","PREGNANCY CARE","FAMILY PLANNING SERVICES","GENERAL HEALTH EDUCATION","ORAL HEALTH","EYE CARE","EAR, NOSE AND THROAT (ENT) CARE","SKIN CARE","ORTHOPEDIC CARE","MENTAL HEALTH","PEDIATRIC / KIDS HEALTH","AMBULANCE SERVICE"];
const exactServicesRaw = {"MEDICATION":["Injection","Intravenous Therapy","Transdermal","Patches","Adverse Effects Monitoring"],"WOUND CARE":["Dressing Procedures","Suture and Staple Removal","Second Closure","Negative Pressure Monitoring","Bed Sore Care"],"RESPIRATORY CARE":["Nebulizer Treatment","Asthmatic Care","Monitoring","Oxygen Therapy"],"HEALTH MONITORING":["Vital Signs Tracking","Blood Glucose Monitoring","Weight Scaling","Exercise","Diet"],"URINARY CARE":["Catheterization and Catheter Care","Irrigation","Urine Testing"],"GASTRO CARE":["Ostomy and Stoma Care","Colostomy Bag","Abdominal Skin Care","Tube Feeding","NG Tube Insertion and Care","Enema"],"PHYSICAL CARE":["Mobilization","Ambulatory Care","Skeletal Traction Care","Cast and Splint Care","Healthy Exercises"],"DIAGNOSTIC CARE":["Specimen Collection","Urinalysis","Pregnancy Test","Malaria Testing","Instant Ultrasound","Instant X-Ray","All RDTs"],"OTHER LABORATORY SERVICES":["Fasting Blood Sugar","Random Blood Sugar","H. Pylori","Retroviral Screening","Hepatitis A Screening","Hepatitis B Screening","Hepatitis C Screening","Gonorrhea Screening","Syphilis Screening","Full Blood Count","Blood Grouping and RH","Electrolyte, Urea and Creatinine","Kidney Function Test","Liver Function Test","Sputum Collection"],"PREGNANCY CARE":["Pregnancy Test","Antenatal Care","Delivery Care","Elective CS","Emergency CS","CS Wound Care"],"FAMILY PLANNING SERVICES":["Health Education and Decision Making Practice","Oral Pills","Injectable Methods","Intrauterine Device","Implant","Patch","Barrier Methods","Implant Removal","Other Family Planning Care"],"GENERAL HEALTH EDUCATION":["General Health Education"],"ORAL HEALTH":["Oral Health"],"EYE CARE":["Eye Care"],"EAR, NOSE AND THROAT (ENT) CARE":["Ear, Nose and Throat (ENT) Care"],"SKIN CARE":["Skin Care"],"ORTHOPEDIC CARE":["Orthopedic Care"],"MENTAL HEALTH":["Mental Health Support"],"PEDIATRIC / KIDS HEALTH":["Pediatric / Kids Health"],"AMBULANCE SERVICE":["Request Ambulance"]};

function makeId(str) {
  return str.replace(/\//g, '-').trim();
}

async function seed() {
  try {
    console.log("Cleaning up old categories...");
    const oldCats = await getDocs(collection(db, 'serviceCategories'));
    for (const d of oldCats.docs) {
      await deleteDoc(doc(db, 'serviceCategories', d.id));
    }
    
    console.log("Cleaning up old services...");
    const oldServices = await getDocs(collection(db, 'services'));
    for (const d of oldServices.docs) {
      await deleteDoc(doc(db, 'services', d.id));
    }

    console.log("Seeding categories...");
    for (const name of exactCategories) {
      await setDoc(doc(db, 'serviceCategories', makeId(name)), {
        name,
        active: true
      });
    }

    console.log("Seeding services...");
    let id = 1;
    for (const [catName, services] of Object.entries(exactServicesRaw)) {
      for (const sName of services) {
        await setDoc(doc(db, 'services', 's_' + id++), {
          name: sName,
          categoryId: makeId(catName),
          price: 5000,
          description: 'Professional ' + sName,
          roles: ['RN', 'LPN'],
          active: true
        });
      }
    }
    console.log("Done seeding!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
