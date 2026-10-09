const fs = require('fs');

const exactCategories = [
  "Medication & Therapy",
  "Wound Care",
  "Respiratory Care",
  "Health Monitoring",
  "Urinary Care",
  "Gastro Care",
  "Physical Care",
  "Diagnostic Services",
  "Laboratory Services",
  "Pregnancy & Maternity",
  "Family Planning",
  "Health Education",
  "Oral Health",
  "Eye Care",
  "ENT Care",
  "Skin Care",
  "Orthopedic Care",
  "Mental Health",
  "Pediatric Care",
  "Physician Care",
  "Specialist Care",
  "Ambulance Service",
  "Pharmacy Services"
];

const exactServicesRaw = {
  "Medication & Therapy": [
    "Injection",
    "Intravenous Therapy",
    "Transdermal",
    "Patches",
    "Adverse Effects Monitoring"
  ],
  "Wound Care": [
    "Dressing Procedures",
    "Suture and Staple Removal",
    "Second Closure",
    "Negative Pressure Monitoring",
    "Bed Sore Care"
  ],
  "Respiratory Care": [
    "Nebulizer Treatment",
    "Asthmatic Care",
    "Monitoring",
    "Oxygen Therapy"
  ],
  "Health Monitoring": [
    "Vital Signs Tracking",
    "Blood Glucose Monitoring",
    "Weight Scaling",
    "Exercise",
    "Diet"
  ],
  "Urinary Care": [
    "Catheterization and Catheter Care",
    "Irrigation",
    "Urine Testing"
  ],
  "Gastro Care": [
    "Ostomy and Stoma Care",
    "Colostomy Bag",
    "Abdominal Skin Care",
    "Tube Feeding",
    "NG Tube Insertion and Care",
    "Enema"
  ],
  "Physical Care": [
    "Mobilization",
    "Ambulatory Care",
    "Skeletal Traction Care",
    "Cast and Splint Care",
    "Healthy Exercises"
  ],
  "Diagnostic Services": [
    "Specimen Collection",
    "Urinalysis",
    "Pregnancy Test",
    "Malaria Testing",
    "Instant Ultrasound",
    "Instant X-Ray",
    "All RDTs"
  ],
  "Laboratory Services": [
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
  "Pregnancy & Maternity": [
    "Pregnancy Test",
    "Antenatal Care",
    "Delivery Care",
    "Postpartum Care",
    "Elective CS",
    "Emergency CS",
    "CS Wound Care"
  ],
  "Family Planning": [
    "Health Education and Decision Making Practice",
    "Oral Pills",
    "Injectable Methods",
    "Intrauterine Device",
    "Implant",
    "Patch",
    "Barrier Methods",
    "Implant Removal",
    "Other Family Planning Care"
  ]
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
console.log("Patched fallback strings successfully V2");
