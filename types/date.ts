import { DateRange as DayPickerRange } from "react-day-picker";

export interface CustomDateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export type DateRangeProps = CustomDateRange | DayPickerRange;
