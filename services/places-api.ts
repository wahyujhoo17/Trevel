import axios from "axios";

const geoDbApi = axios.create({
  baseURL: "https://wft-geo-db.p.rapidapi.com/v1/geo",
  headers: {
    "X-RapidAPI-Key": "dde7fedb0fmsh6f8d590ce5843dbp16195bjsnb061dca5536d",
    "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
  },
});

export const searchCities = async (searchTerm: string) => {
  if (searchTerm.length < 2) return [];

  try {
    const response = await geoDbApi.get("/cities", {
      params: {
        namePrefix: searchTerm,
        limit: 10,
        countryIds: "ID,TH,VN,MY,SG",
        sort: "-population",
        types: "CITY",
      },
    });

    return response.data.data.map((city: any) => ({
      id: city.id,
      name: `${city.city}, ${city.country}`,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
    }));
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};
