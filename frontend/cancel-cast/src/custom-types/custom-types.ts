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
  pickup_location: number;
  drop_location: number;
  avg_vtat: number;
  avg_ctat: number;
  driver_rating: number;
  booking_value: number;
  ride_distance: number;
  prediction: number;
}
