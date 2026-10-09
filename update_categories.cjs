const fs = require('fs');

const exactCategories = [
  "MEDICATION",
  "WOUND CARE",
  "RESPIRATORY CARE",
  "HEALTH MONITORING",
  "URINARY CARE",
  "GASTRO CARE",
  "PHYSICAL CARE",
  "DIAGNOSTIC CARE",
  "OTHER LABORATORY SERVICES",
  "PREGNANCY CARE",
  "FAMILY PLANNING SERVICES",
  "GENERAL HEALTH EDUCATION",
  "ORAL HEALTH",
  "EYE CARE",
  "EAR, NOSE AND THROAT (ENT) CARE",
  "SKIN CARE",
  "ORTHOPEDIC CARE",
  "MENTAL HEALTH",
  "PEDIATRIC / KIDS HEALTH",
  "AMBULANCE SERVICE"
];

const exactServicesRaw = {
  "MEDICATION": [
    "Injection",
    "Intravenous Therapy",
    "Transdermal",
    "Patches",
    "Adverse Effects Monitoring"
  ],
  "WOUND CARE": [
    "Dressing Procedures",
    "Suture and Staple Removal",
    "Second Closure",
    "Negative Pressure Monitoring",
    "Bed Sore Care"
  ],
  "RESPIRATORY CARE": [
    "Nebulizer Treatment",
    "Asthmatic Care",
    "Monitoring",
    "Oxygen Therapy"
  ],
  "HEALTH MONITORING": [
    "Vital Signs Tracking",
    "Blood Glucose Monitoring",
    "Weight Scaling",
    "Exercise",
    "Diet"
  ],
  "URINARY CARE": [
    "Catheterization and Catheter Care",
    "Irrigation",
    "Urine Testing"
  ],
  "GASTRO CARE": [
    "Ostomy and Stoma Care",
    "Colostomy Bag",
    "Abdominal Skin Care",
    "Tube Feeding",
    "NG Tube Insertion and Care",
    "Enema"
  ],
  "PHYSICAL CARE": [
    "Mobilization",
    "Ambulatory Care",
    "Skeletal Traction Care",
    "Cast and Splint Care",
    "Healthy Exercises"
  ],
  "DIAGNOSTIC CARE": [
    "Specimen Collection",
    "Urinalysis",
    "Pregnancy Test",
    "Malaria Testing",
    "Instant Ultrasound",
    "Instant X-Ray",
    "All RDTs"
  ],
  "OTHER LABORATORY SERVICES": [
    "Fasting Blood Sugar",
    "Random Blood Sugar",
    "H. Pylori",
    "Retroviral Screening",
    "Hepatitis A Screening",
    "Hepatitis B Screening",
    "Hepatitis C Screening",
    "Gonorrhea Screening",
    "Syphilis Screening",
    "Full Blood Count",
    "Blood Grouping and RH",
    "Electrolyte, Urea and Creatinine",
    "Kidney Function Test",
    "Liver Function Test",
    "Sputum Collection"
  ],
  "PREGNANCY CARE": [
    "Pregnancy Test",
    "Antenatal Care",
    "Delivery Care",
    "Elective CS",
    "Emergency CS",
    "CS Wound Care"
  ],
  "FAMILY PLANNING SERVICES": [
    "Health Education and Decision Making Practice",
    "Oral Pills",
    "Injectable Methods",
    "Intrauterine Device",
    "Implant",
    "Patch",
    "Barrier Methods",
    "Implant Removal",
    "Other Family Planning Care"
  ],
  "GENERAL HEALTH EDUCATION": ["General Health Education"],
  "ORAL HEALTH": ["Oral Health"],
  "EYE CARE": ["Eye Care"],
  "EAR, NOSE AND THROAT (ENT) CARE": ["Ear, Nose and Throat (ENT) Care"],
  "SKIN CARE": ["Skin Care"],
  "ORTHOPEDIC CARE": ["Orthopedic Care"],
  "MENTAL HEALTH": ["Mental Health Support"],
  "PEDIATRIC / KIDS HEALTH": ["Pediatric / Kids Health"],
  "AMBULANCE SERVICE": ["Request Ambulance"]
};

const FALLBACK_CATEGORIES = exactCategories.map(name => ({ id: name, name, active: true }));

let sId = 1;
const FALLBACK_SERVICES = [];
for (const [catName, services] of Object.entries(exactServicesRaw)) {
  for (const sName of services) {
    FALLBACK_SERVICES.push({
      id: 'fs_' + sId++,
      categoryId: catName,
      name: sName,
      price: 5000,
      roles: ['RN', 'LPN'],
      description: 'Professional ' + sName,
      active: true
    });
  }
}

const catStr = JSON.stringify(FALLBACK_CATEGORIES);
const serStr = JSON.stringify(FALLBACK_SERVICES);

function patchFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  
  content = content.replace(
    /\{\(categories\.length > 0 \? categories : \[.*?\]\)\.map/g,
    `{(categories.length > 0 ? categories : ${catStr}).map`
  );

  content = content.replace(
    /\{\(allServices\.length > 0 \? allServices : \[.*?\]\)\.filter/g,
    `{(allServices.length > 0 ? allServices : ${serStr}).filter`
  );

  fs.writeFileSync(filename, content);
}

patchFile('src/components/PatientApp.tsx');
patchFile('src/components/AdminApp.tsx');
console.log("Patched fallback strings successfully V3");
