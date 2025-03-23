import { BaseFlight, PlanBase, CityGroupBase, BaseCar } from "./shared";
// export type { Car } from "./shared";

export interface Flight extends BaseFlight {}

export interface Hotel {
  id?: string;
  name: string;
  hotelName?: string;
  mainImage?: string;
  description?: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  ratePerNight: number | string;
  amenities?: string[];
  rating?: number;
  city?: string;
  totalCost?: number;
}

// Define Car type based on BaseCar
export interface Car extends BaseCar {
  status?: "available" | "booked" | "maintenance";
}

export interface PlanItem extends PlanBase {
  totalCost: any;
  amenities: boolean;
  checkInTime: any;
  description: any;
  checkOutDate: any;
  checkInDate: any;
  ratePerNight: any;
  rating: any;
  hotelName: string;
  mainImage: any;
  destination: string | undefined;
  id: string;
  type: "flight" | "hotel" | "car";
  userId: string;
  code?: string;
  city?: string;
  flight?: Flight;
  hotel?: Hotel;
  car?: Car;
  createdAt: any;
  quantity?: number;
}

export interface CityGroup extends CityGroupBase {
  code: string;
  city: string;
  name: string;
  country: string;
  flights: PlanItem[];
  hotels: PlanItem[];
  cars: PlanItem[];
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
