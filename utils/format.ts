import { locations } from "@/data/locations";
import { CityGroup, PlanItem } from "@/types/plans";

// Updated formatLocation function with enhanced display
export const formatLocation = (code: string | undefined): string => {
  if (!code) return "Unknown";

  // Find location by code
  const location = locations.find((loc) => loc.code === code);
  if (!location) return code; // Fallback to just showing the code

  // Return formatted string with both city and code
  return `${location.city} (${location.code})`;
};

// Fungsi untuk mendapatkan tanggal dalam format lokal
export const formatDate = (date: string): string => {
  if (!date) return "N/A";

  try {
    const dateObj = new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return date;
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return date;
  }
};

// Format harga dengan konsisten
export const formatPrice = (price: string | number | undefined): string => {
  if (price === undefined) return "$0";

  if (typeof price === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  // If it's already a string, just return it if it looks like a price
  if (price.startsWith("$") || price.startsWith("€")) {
    return price;
  }

  // Try to parse it as a number
  const numericPrice = parseFloat(price);
  if (!isNaN(numericPrice)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  }

  return price;
};

// in MyPlanContent.tsx

// Group plans by destination with proper type checking
const groupPlansByCity = (plans: PlanItem[]): CityGroup[] => {
  if (!plans || plans.length === 0) return [];

  const groups: { [key: string]: CityGroup } = {};

  plans.forEach((plan) => {
    let code = "";
    let city = "";

    if (plan.type === "hotel" && plan.hotel) {
      code = plan.code || "UNKNOWN";
      city = plan.city || plan.hotel.name || "Unknown Location";
    } else if (plan.flight) {
      code = plan.flight.destination;
      city = formatLocation(code);
    } else if (plan.car) {
      code = plan.car.location;
      city = formatLocation(code);
    }

    const groupKey = code.toUpperCase();

    if (!groups[groupKey]) {
      groups[groupKey] = {
        city,
        code,
        name: city,
        country: "Unknown",
        flights: [],
        hotels: [],
        cars: [],
      };
    }

    if (plan.type === "hotel") {
      groups[groupKey].hotels.push(plan);
    } else if (plan.flight) {
      groups[groupKey].flights.push(plan);
    } else if (plan.car) {
      groups[groupKey].cars.push(plan);
    }
  });

  return Object.values(groups);
};
