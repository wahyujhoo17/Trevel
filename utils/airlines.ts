export interface Airline {
  code: string;
  name: string;
  logo?: string;
  alliance?: string;
}

export const airlines: Record<string, Airline> = {
  // Star Alliance
  SQ: {
    code: "SQ",
    name: "Singapore Airlines",
    alliance: "Star Alliance",
    logo: "https://logo.clearbit.com/singaporeair.com",
  },
  TG: {
    code: "TG",
    name: "Thai Airways",
    alliance: "Star Alliance",
    logo: "https://logo.clearbit.com/thaiairways.com",
  },
  NH: {
    code: "NH",
    name: "All Nippon Airways",
    alliance: "Star Alliance",
    logo: "https://logo.clearbit.com/ana.co.jp",
  },
  UA: {
    code: "UA",
    name: "United Airlines",
    alliance: "Star Alliance",
    logo: "https://logo.clearbit.com/united.com",
  },
  AC: {
    code: "AC",
    name: "Air Canada",
    alliance: "Star Alliance",
    logo: "https://logo.clearbit.com/aircanada.com",
  },
  LH: {
    code: "LH",
    name: "Lufthansa",
    alliance: "Star Alliance",
    logo: "https://logo.clearbit.com/lufthansa.com",
  },
  TK: {
    code: "TK",
    name: "Turkish Airlines",
    alliance: "Star Alliance",
    logo: "https://logo.clearbit.com/turkishairlines.com",
  },
  ET: {
    code: "ET",
    name: "Ethiopian Airlines",
    alliance: "Star Alliance",
    logo: "https://logo.clearbit.com/ethiopianairlines.com",
  },

  // SkyTeam
  GA: {
    code: "GA",
    name: "Garuda Indonesia",
    alliance: "SkyTeam",
    logo: "https://logo.clearbit.com/garuda-indonesia.com",
  },
  KL: {
    code: "KL",
    name: "KLM Royal Dutch Airlines",
    alliance: "SkyTeam",
    logo: "https://logo.clearbit.com/klm.com",
  },
  AF: {
    code: "AF",
    name: "Air France",
    alliance: "SkyTeam",
    logo: "https://logo.clearbit.com/airfrance.com",
  },
  KE: {
    code: "KE",
    name: "Korean Air",
    alliance: "SkyTeam",
    logo: "https://logo.clearbit.com/koreanair.com",
  },
  CI: {
    code: "CI",
    name: "China Airlines",
    alliance: "SkyTeam",
    logo: "https://logo.clearbit.com/china-airlines.com",
  },

  // Oneworld
  QR: {
    code: "QR",
    name: "Qatar Airways",
    alliance: "Oneworld",
    logo: "https://logo.clearbit.com/qatarairways.com",
  },
  BA: {
    code: "BA",
    name: "British Airways",
    alliance: "Oneworld",
    logo: "https://logo.clearbit.com/britishairways.com",
  },
  CX: {
    code: "CX",
    name: "Cathay Pacific",
    alliance: "Oneworld",
    logo: "https://logo.clearbit.com/cathaypacific.com",
  },
  JL: {
    code: "JL",
    name: "Japan Airlines",
    alliance: "Oneworld",
    logo: "https://logo.clearbit.com/jal.co.jp",
  },
  AA: {
    code: "AA",
    name: "American Airlines",
    alliance: "Oneworld",
    logo: "https://logo.clearbit.com/aa.com",
  },
  QF: {
    code: "QF",
    name: "Qantas Airways",
    alliance: "Oneworld",
    logo: "https://logo.clearbit.com/qantas.com",
  },

  // Low-cost carriers & others
  EK: {
    code: "EK",
    name: "Emirates",
    alliance: "None",
    logo: "https://logo.clearbit.com/emirates.com",
  },
  OD: {
    code: "OD",
    name: "Batik Air Malaysia",
    alliance: "None",
    logo: "https://logo.clearbit.com/batikair.com",
  },
  ID: {
    code: "ID",
    name: "Batik Air Indonesia",
    alliance: "None",
    logo: "https://logo.clearbit.com/batikair.com",
  },
  "3K": {
    code: "3K",
    name: "Jetstar Asia",
    alliance: "None",
    logo: "https://logo.clearbit.com/jetstar.com",
  },
  VJ: {
    code: "VJ",
    name: "VietJet Air",
    alliance: "None",
    logo: "https://logo.clearbit.com/vietjetair.com",
  },
  AK: {
    code: "AK",
    name: "AirAsia Malaysia",
    alliance: "None",
    logo: "https://logo.clearbit.com/airasia.com",
  },
  QZ: {
    code: "QZ",
    name: "AirAsia Indonesia",
    alliance: "None",
    logo: "https://logo.clearbit.com/airasia.com",
  },
  FD: {
    code: "FD",
    name: "Thai AirAsia",
    alliance: "None",
    logo: "https://logo.clearbit.com/airasia.com",
  },
  TR: {
    code: "TR",
    name: "Scoot",
    alliance: "None",
    logo: "https://logo.clearbit.com/flyscoot.com",
  },
  FZ: {
    code: "FZ",
    name: "Flydubai",
    alliance: "None",
    logo: "https://logo.clearbit.com/flydubai.com",
  },
  WY: {
    code: "WY",
    name: "Oman Air",
    alliance: "None",
    logo: "https://logo.clearbit.com/omanair.com",
  },
  XY: {
    code: "XY",
    name: "flynas",
    alliance: "None",
    logo: "https://logo.clearbit.com/flynas.com",
  },
  WN: {
    code: "WN",
    name: "Southwest Airlines",
    alliance: "None",
    logo: "https://logo.clearbit.com/southwest.com",
  },
  FR: {
    code: "FR",
    name: "Ryanair",
    alliance: "None",
    logo: "https://logo.clearbit.com/ryanair.com",
  },
  U2: {
    code: "U2",
    name: "easyJet",
    alliance: "None",
    logo: "https://logo.clearbit.com/easyjet.com",
  },
  DY: {
    code: "DY",
    name: "Norwegian Air",
    alliance: "None",
    logo: "https://logo.clearbit.com/norwegian.com",
  },
  QG: {
    code: "QG",
    name: "Citilink",
    alliance: "None",
    logo: "https://logo.clearbit.com/citilink.co.id",
  },
  HO: {
    code: "HO",
    name: "Juneyao Airlines",
    alliance: "None",
    logo: "https://logo.clearbit.com/juneyaoair.com",
  },
  H1: {
    code: "H1",
    name: "Hahn Air Systems",
    alliance: "None",
    logo: "https://logo.clearbit.com/hahnair.com",
  },
  MF: {
    code: "MF",
    name: "XiamenAir",
    alliance: "SkyTeam",
    logo: "https://logo.clearbit.com/xiamenair.com.cn",
  },
};

export const getAirlineName = (carrierCode: string): string => {
  return airlines[carrierCode]?.name || carrierCode;
};

export const getAirlineInfo = (carrierCode: string): Airline | undefined => {
  return airlines[carrierCode];
};
