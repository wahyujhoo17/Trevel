export interface Location {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export const locations: Location[] = [
    {
      id: "1",
      name: "Ngurah Rai International Airport",
      code: "DPS",
      city: "Denpasar",
      country: "Indonesia",
      coordinates: { lat: -8.3405, lon: 115.092 },
    },
    {
      id: "2",
      name: "Suvarnabhumi Airport",
      code: "BKK",
      city: "Bangkok",
      country: "Thailand",
      coordinates: { lat: 13.7563, lon: 100.5018 },
    },
    {
      id: "3",
      name: "Changi Airport",
      code: "SIN",
      city: "Singapore",
      country: "Singapore",
      coordinates: { lat: 1.3521, lon: 103.8198 },
    },
    {
      id: "4",
      name: "Kuala Lumpur International Airport",
      code: "KUL",
      city: "Kuala Lumpur",
      country: "Malaysia",
      coordinates: { lat: 3.139, lon: 101.6869 },
    },
    {
      id: "5",
      name: "Ninoy Aquino International Airport",
      code: "MNL",
      city: "Manila",
      country: "Philippines",
      coordinates: { lat: 14.5995, lon: 120.9842 },
    },
    {
      id: "6",
      name: "Tan Son Nhat International Airport",
      code: "SGN",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      coordinates: { lat: 10.8231, lon: 106.6297 },
    },
    {
      id: "7",
      name: "Phnom Penh International Airport",
      code: "PNH",
      city: "Phnom Penh",
      country: "Cambodia",
      coordinates: { lat: 11.5466, lon: 104.8441 },
    },
    {
      id: "8",
      name: "Noi Bai International Airport",
      code: "HAN",
      city: "Hanoi",
      country: "Vietnam",
      coordinates: { lat: 21.2214, lon: 105.8067 },
    },
    {
      id: "9",
      name: "Yangon International Airport",
      code: "RGN",
      city: "Yangon",
      country: "Myanmar",
      coordinates: { lat: 16.9074, lon: 96.1335 },
    },
    {
      id: "10",
      name: "Wattay International Airport",
      code: "VTE",
      city: "Vientiane",
      country: "Laos",
      coordinates: { lat: 17.9883, lon: 102.5634 },
    },
    {
      id: "11",
      name: "Juanda International Airport",
      code: "SUB",
      city: "Surabaya",
      country: "Indonesia",
      coordinates: { lat: -7.3797, lon: 112.7875 },
    },
    {
      id: "12",
      name: "Sultan Hasanuddin International Airport",
      code: "UPG",
      city: "Makassar",
      country: "Indonesia",
      coordinates: { lat: -5.0616, lon: 119.5542 },
    },
    {
      id: "13",
      name: "Davao International Airport",
      code: "DVO",
      city: "Davao",
      country: "Philippines",
      coordinates: { lat: 7.1256, lon: 125.646 },
    },
    {
      id: "14",
      name: "Sam Ratulangi International Airport",
      code: "MDC",
      city: "Manado",
      country: "Indonesia",
      coordinates: { lat: 1.5496, lon: 124.9262 },
    },
    {
      id: "15",
      name: "Don Mueang International Airport",
      code: "DMK",
      city: "Bangkok",
      country: "Thailand",
      coordinates: { lat: 13.9126, lon: 100.6079 },
    },
  ];
  
  