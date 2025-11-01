export interface UberRide {
  vehicle_type: string;
  pickup_location: string;
  drop_location: string;
  avg_vtat: number;
  hour: number;
  month: number;
  weekday: number;
}

export interface Driver {
  driver_name: string;
  vehicle_type: string;
  pickup_location: string;
  drop_location: string;
  date: string;
  hour: string;
  avg_vtat: number;
  prediction: number;
}

export interface Preditions {
  prediction: number;
}
