export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number | string;
  currency: string;
  departureDate: string;
  cabin: string;
  numberOfBookableSeats: number;
  baggage:
    | {
        cabin?: string;
        checked?: string;
      }
    | string; // Allow both string and object format
  terminal?: string;
  aircraftType?: string;
}
