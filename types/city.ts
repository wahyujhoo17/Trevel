import { BaseCityGroup, BaseCar } from "./shared";

export interface Car extends BaseCar {
  image?: string;
  availableFrom: string;
  availableTo: string;
}

export interface CityGroup extends BaseCityGroup {
  cars: Car[];
}
