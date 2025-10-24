import { useState } from "react";
import DriverCard from "../components/DriverCard";
import { Driver, UberRide } from "../custom-types/custom-types";
import useApi from "../hooks/useApi";

const DriverSearchPage = () => {
  const { getPrediction } = useApi();

  const drivers = [
    "Whisker McClaw",
    "Tabby Pawsworth",
    "Clawdia Scrathington",
    "Felix Meowser",
    "Luna Whipstail",
    "Sven",
  ];

  const vehicle = [
    "Go Mini",
    "Go Sedan",
    "Premier Sedan",
    "Ubere XL",
    "Auto"
  ]

  const now = new Date();

  const randomNum = Math.floor(Math.random() * 5) + 1;
  const randomNumForDriver = Math.floor(Math.random() * 5) + 1;
  const value = Math.floor(Math.random() * 300) + 100;
  const ctat = Math.floor(Math.random() * 50) + 10;
  const randomVehicle = vehicle[randomNum]

  const predict = () => {
    const uberRide: UberRide = {
        vehicle_type: randomVehicle,
        pickup_location: ,
        drop_location: ,
        payment_method: ,
        avg_vtat: randomNum,
        avg_ctat: ctat,
        booking_value: value,
        ride_distance: ,
        driver_ratings: randomNumForDriver,
        customer_rating: 4.8,
        hour: now.getHours(),
        weekday: now.getDay(),
    }

    return getPrediction(uberRide)
  }

  return (
    <>
    {drivers.map((driverName) => {  
        const driver: Driver = {
            driver_name: driverName,
            vehicle_type: randomVehicle,
            pickup_location:,
            drop_location:,
            avg_vtat: randomNum,
            avg_ctat: ctat,
            driver_rating: randomNumForDriver,
            booking_value: value,
            ride_distance:,
            prediction: predict(),
        };

        <DriverCard driver={driver}/>
    })}
    </>
  )
};

export default DriverSearchPage;
