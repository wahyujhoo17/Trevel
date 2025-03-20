import { Flight } from "./flight";

export interface PlanItem {
  id: string;
  userId: string;
  flightId: string;
  quantity: number;
  flight: Flight;
  dateAdded: string;
  status: string;
}

export interface CityGroup {
  city: string;
  code: string;
  flights: PlanItem[];
  hotels?: any[]; // Add proper type when implemented
  cars?: any[]; // Add proper type when implemented
}