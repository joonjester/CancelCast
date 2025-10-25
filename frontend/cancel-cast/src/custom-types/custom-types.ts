export interface UberRide {
  vehicle_type: string;
  pickup_location: string;
  drop_location: string;
  payment_method: string;
  avg_vtat: number;
  avg_ctat: number;
  booking_value: number;
  ride_distance: number;
  driver_ratings: number;
  customer_rating: number;
  hour: number;
  weekday: number;
}

export interface Driver {
  driver_name: string;
  vehicle_type: string;
  pickup_location: string;
  drop_location: string;
  avg_vtat: number;
  avg_ctat: number;
  driver_rating: number;
  booking_value: number;
  ride_distance: number;
  predictionLogReg: number;
  predictionRf: number;
}

export interface Preditions {
  prediction_logreg: number;
  prediction_rf: number;
}
