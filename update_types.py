import sys

content = open('src/types.ts').read()

new_fields = """  serviceArea: number; // radius in km
  lastLocationUpdate?: number; // timestamp

  // Application Fields
  applicationStatus?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'suspended' | 'requires_information';
  rejectionReason?: string;
  informationRequested?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  licenseNumber?: string;
  registrationBody?: string;
  qualification?: string;
  institution?: string;
  qualificationYear?: string;
  experienceYears?: string;
  documents?: string[];
"""

content = content.replace("  serviceArea: number; // radius in km\n  lastLocationUpdate?: number; // timestamp", new_fields)

open('src/types.ts', 'w').write(content)
print("Updated types.ts")
