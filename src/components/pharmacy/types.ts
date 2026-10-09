export interface PackageOption {
  id: string;
  packageSize: string;
  price: number;
  unitPrice: number;
  isBestValue?: boolean;
}

export interface PharmacyProduct {
  id?: string;
  name: string;
  genericName: string;
  brandName?: string;
  isBrand?: boolean;
  category: string;
  description: string;
  uses: string;
  manufacturer: string;
  strength: string;
  dosageForm: string;
  packages: PackageOption[];
  packSize: string; // legacy fallback
  imageUrl: string;
  price: number; // legacy fallback or starting price
  stockQuantity: number;
  prescriptionRequired: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  product: PharmacyProduct;
  selectedPackage: PackageOption;
  quantity: number;
}

export interface PharmacyOrder {
  id?: string;
  clientId: string;
  items: {
    productId: string;
    name: string;
    packageName: string;
    price: number;
    quantity: number;
    prescriptionRequired: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'processing' | 'successful' | 'failed' | 'refunded' | 'cancelled';
  orderStatus: 'Pending' | 'Payment Confirmed' | 'Prescription Review' | 'Confirmed' | 'Preparing' | 'Ready for Delivery' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Refunded';
  prescriptionStatus: 'Not Required' | 'Pending Review' | 'Approved' | 'Rejected' | 'Requires More Information' | 'Expired';
  deliveryAddress: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    instructions: string;
  };
  deliveryMethod: 'Standard' | 'Express';
  deliveryDate: string;
  deliveryTimeSlot: string;
  prescriptionData?: string; // base64 string
  createdAt: number;
  updatedAt: number;
}
