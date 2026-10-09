export type Provider = {
  id: string; // Document ID
  providerId: string;
  name: string;
  type?: 'nurse' | 'physician';
  specialty?: string;
  consultationFee?: number;
  clinicLocation?: string;
  consultationTypes?: ('in-person' | 'online')[];
  professionalRole: string; // 'RN', 'LPN', 'CNA', 'NP'
  verified: boolean;
  available: boolean;
  isBusy?: boolean;
  currentBookingId?: string | null;
  latitude: number;
  longitude: number;
  geohash: string; // Not strictly needed for simple filtering but asked for
  services: string[]; // e.g. ['Wound Care', 'IV Therapy', 'Post-Op Care']
  rating: number;
  estimatedArrival: number; // minutes
  serviceArea: number; // radius in km
  lastLocationUpdate?: number; // timestamp
  locationAccuracy?: number;
  locationEnabled?: boolean;
  locationUpdatedAt?: number;

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

};

export type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DECLINED';

export type Booking = {
  id: string; // Document ID
  bookingId: string;
  patientId: string;
  providerId: string;
  service: string;
  patientLatitude: number;
  patientLongitude: number;
  date: string;
  time: string;
  price: number;
  status: BookingStatus;
  createdAt: number;
  clientName?: string;
  clientPhone?: string;
  providerName?: string;
  providerPhone?: string;
  providerLatitude?: number;
  providerLongitude?: number;
  bookingType?: 'nurse' | 'physician';
  specialty?: string;
  consultationType?: 'in-person' | 'online';
  clinicLocation?: string;
  isTrackingActive?: boolean;
  lastLocationUpdate?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded' | 'paid' | 'paid_test';
  paymentMode?: string;
};
