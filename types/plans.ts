import { Flight } from "./flight";

export interface PlanItem {
  id: string;
  userId?: string;
  type?: "hotel" | "flight" | "car";

  // Hotel direct properties
  hotelName?: string;
  description?: string;
  mainImage?: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  rating?: number;
  ratePerNight?: string;

  // Location properties - tambahkan ini
  destination?: string; // General location (e.g. "Bali")
  city?: string; // City name (e.g. "Denpasar")
  code?: string; // Location code (e.g. "DPS")

  // Flight data (dalam properti 'flight')
  flight?: {
    airline: string;
    flightNumber: string;
    departureDate: string;
    departureTime: string;
    arrivalTime: string;
    origin: string;
    destination: string;
    cabin: string;
    price: string | number;
  } | null;

  // Hotel data (dalam properti 'hotel' - format alternatif)
  hotel?: {
    name: string;
    city: string;
    checkInDate?: string;
    checkOutDate?: string;
  } | null;

  // Car data
  car?: {
    model: string;
    location: string;
    pickupDate?: string;
    returnDate?: string;
  } | null;

  // General properties
  createdAt?: any;
  dateAdded?: string;
  status?: string;
  quantity?: number;
  flightId?: string;

  // Allow additional properties
  [key: string]: any;
}

export interface CityGroup {
  city: string;
  code: string;
  flights: PlanItem[];
  hotels: PlanItem[];
  cars: PlanItem[];
}

export interface Flight {
  // ... existing properties ...
  price: number;
  currency: string;
}

export interface HotelPlan {
  id: string;
  hotelName: string;
  description: string;
  checkInTime: string;
  checkOutTime: string;
  ratePerNight: string;
  rating: number;
  mainImage: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  userId: string;
  createdAt: any; // Firestore Timestamp
  destination?: string;
}
