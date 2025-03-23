export interface BaseCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  location: string;
  pickupDate: string;
  returnDate: string;
  price: number;
  transmission: "automatic" | "manual";
  type: "sedan" | "suv" | "van" | "other";
  seats: number;
  status?: "available" | "booked" | "maintenance";
}

export interface Car extends BaseCar {}

export interface CarPlan extends BaseCar {
  pickup_date?: string;
  return_date?: string;
  total_price?: number;
}

export interface BaseCityGroup {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface BaseFlight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  cabin: string;
  price: number | string;
  duration?: string;
  currency?: string;
  numberOfBookableSeats?: number;
  baggage?: {
    cabin?: string;
    checked?: string;
  };
}

export interface Flight extends BaseFlight {
  // Additional flight-specific properties can go here
}

export interface ExtendedFlight extends BaseFlight {}

export interface PlanBase {
  id: string;
  type: "flight" | "hotel" | "car";
  userId: string;
  code?: string;
  city?: string;
  createdAt: any;
  status?: "confirmed" | "pending" | "cancelled";
}

export interface CityGroupBase {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface BaseHotel {
  name: string;
  mainImage?: string;
  description?: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  ratePerNight: string | number;
}

export interface Hotel extends BaseHotel {
  id?: string;
  hotelName?: string;
  amenities?: string[];
  rating?: number;
}

export interface BasePlan {
  id: string;
  type: "flight" | "hotel" | "car";
  userId: string;
  code?: string;
  city?: string;
  createdAt: any;
  quantity?: number;
}

export interface PlanItem extends BasePlan {
  flight?: Flight;
  hotel?: Hotel;
  car?: Car; // Updated to use the new Car interface
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
