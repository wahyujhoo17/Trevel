import { locations } from "@/data/locations";

export const formatLocation = (code: string) => {
  const location = locations.find((loc) => loc.code === code);
  return location ? `${location.name} (${code})` : code;
};