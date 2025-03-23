import { ExtendedFlight } from "./shared";

export interface Flight {
  id?: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  cabin: string;
  price: number | string;
}

export interface Hotel {
  id?: string;
  name: string;
  mainImage?: string;
  description?: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  ratePerNight: number | string;
}

export interface Car {
  id?: string;
  brand: string;
  model: string;
  location: string;
  pickupDate: string;
  returnDate: string;
  price: number;
}

export interface PlanItem {
  id: string;
  type: "flight" | "hotel" | "car";
  userId: string;
  quantity?: number;
  flight?: ExtendedFlight;
  hotel?: {
    name: string;
    mainImage?: string;
    description?: string;
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    ratePerNight: number | string;
  };
  car?: {
    brand: string;
    model: string;
    location: string;
    pickupDate: string;
    returnDate: string;
    price: number;
  };
  code?: string;
  city?: string;
  createdAt: any;
  status?: "confirmed" | "pending" | "cancelled";
}

export interface CityGroup {
  code: string;
  city: string;
  name: string;
  country: string;
  flights: PlanItem[];
  hotels: PlanItem[];
  cars: PlanItem[];
}
