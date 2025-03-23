export interface Destination {
  id: number;
  name: string;
  description: string;
  location: string;
  image: string;
  prices: {
    flight: {
      amount: string;
      extracted: number | null;
    };
    hotel: {
      amount: string;
      extracted: number | null;
    };
  };
  link: string;
}
