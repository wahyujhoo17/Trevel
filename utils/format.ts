import { locations } from "@/data/locations";

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
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

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
const groupPlansByCity = (plans: any[]): CityGroup[] => {
  if (!plans || plans.length === 0) return [];

  const groups: { [key: string]: CityGroup } = {};

  plans.forEach((plan) => {
    // Determine plan type and destination
    let destination: string;
    let planType: "flight" | "hotel";

    if (plan.type === "hotel" || plan.hotelName) {
      planType = "hotel";
      destination = plan.destination || "Unknown";
    } else {
      planType = "flight";
      destination = plan.flight?.destination || "Unknown";
    }

    if (!groups[destination]) {
      groups[destination] = {
        city: extractCityName(destination),
        code: destination,
        flights: [],
        hotels: [],
      };
    }

    if (planType === "hotel") {
      groups[destination].hotels?.push(plan);
    } else {
      groups[destination].flights.push(plan);
    }
  });

  return Object.values(groups);
};
