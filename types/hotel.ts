export interface Hotel {
  id?: string;
  name: string;
  description?: string;
  images?: string[];
  amenities?: string[];
  overall_rating: number;
  reviews: number;
  rate_per_night: string;
  check_in_time: string;
  check_out_time: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  link?: string;
}

// Additional hotel-related types if needed
export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
}
