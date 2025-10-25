import DriverCard from "../components/DriverCard";
import { Select, Option, Box } from "@mui/joy";
import { Driver, UberRide } from "../custom-types/custom-types";
import useApi from "../hooks/useApi";
import React, { useEffect, useState } from "react";

const DriverSearchPage = () => {
  const { getPrediction } = useApi();
  const [pickUp, setPickUp] = useState("");
  const [drop, setDrop] = useState("");
  const [payment, setPayment] = useState("");
  const [routeRanges, setRouteRanges] = useState<{
    distanceMin: number;
    distanceMax: number;
    ctatMin: number;
    ctatMax: number;
    vtatMin: number;
    vtatMax: number;
    bookingMin: number;
    bookingMax: number;
  } | null>(null);
  const [prediction, setPrediction] = useState<number>();
  const [driversData, setDriversData] = useState<Driver[]>([]);

  const drivers = [
    "Whisker McClaw",
    "Tabby Pawsworth",
    "Clawdia Scrathington",
    "Felix Meowser",
    "Luna Whipstail",
    "Sven",
  ];

  const vehicle = ["Go Mini", "Go Sedan", "Premier Sedan", "Ubere XL", "Auto"];

  const handleRouteChange = (_event, newValue: string | null) => {
    if (!newValue) return;

    switch (newValue) {
      case "route1": {
        setRouteRanges({
          distanceMin: 16,
          distanceMax: 46,
          ctatMin: 20,
          ctatMax: 60,
          vtatMin: 2,
          vtatMax: 12,
          bookingMin: 100,
          bookingMax: 900,
        });
        setPickUp("Rohini West");
        setDrop("Sohna Road");
        break;
      }

      case "route2": {
        setRouteRanges({
          distanceMin: 11,
          distanceMax: 49,
          ctatMin: 25,
          ctatMax: 65,
          vtatMin: 3,
          vtatMax: 16,
          bookingMin: 200,
          bookingMax: 1000,
        });
        setPickUp("IMT Manesar");
        setDrop("Subhash Chowk");
        break;
      }

      case "route3": {
        setRouteRanges({
          distanceMin: 15,
          distanceMax: 61,
          ctatMin: 20,
          ctatMax: 58,
          vtatMin: 5,
          vtatMax: 17,
          bookingMin: 250,
          bookingMax: 900,
        });
        setPickUp("Bhiwadi");
        setDrop("DLF City Court");
        break;
      }

      case "route4": {
        setRouteRanges({
          distanceMin: 5,
          distanceMax: 33,
          ctatMin: 20,
          ctatMax: 58,
          vtatMin: 5,
          vtatMax: 17,
          bookingMin: 160,
          bookingMax: 1140,
        });
        setPickUp("Rithala");
        setDrop("Vatika Chowk");
        break;
      }

      case "route5": {
        setRouteRanges({
          distanceMin: 15,
          distanceMax: 65,
          ctatMin: 20,
          ctatMax: 58,
          vtatMin: 5,
          vtatMax: 16,
          bookingMin: 200,
          bookingMax: 1100,
        });
        setPickUp("Tagore Garden");
        setDrop("Udyog Vihar");
        break;
      }

      default: {
        console.warn("Unknown route selected:", newValue);
        break;
      }
    }
  };

  const handlePaymentChange = (_event, newValue: string | null) => {
    if (!newValue) return;
    setPayment(newValue);
  };

  const generateDriversData = async () => {
    if (!routeRanges) return;

    const now = new Date();
    const driversArray: Driver[] = [];

    for (const driverName of drivers) {
      const distance =
        Math.floor(
          Math.random() *
            (routeRanges.distanceMax - routeRanges.distanceMin + 1)
        ) + routeRanges.distanceMin;
      const ctat =
        Math.floor(
          Math.random() * (routeRanges.ctatMax - routeRanges.ctatMin + 1)
        ) + routeRanges.ctatMin;
      const vtat =
        Math.floor(
          Math.random() * (routeRanges.vtatMax - routeRanges.vtatMin + 1)
        ) + routeRanges.vtatMin;
      const bookingValue =
        Math.floor(
          Math.random() * (routeRanges.bookingMax - routeRanges.bookingMin + 1)
        ) + routeRanges.bookingMin;

      const randomNum = Math.floor(Math.random() * 4);
      const randomNumForDriver = Math.floor(Math.random() * 5) + 1;
      const randomVehicle = vehicle[randomNum];

      const uberRide: UberRide = {
        vehicle_type: randomVehicle,
        pickup_location: pickUp,
        drop_location: drop,
        payment_method: payment,
        avg_vtat: vtat,
        avg_ctat: ctat,
        booking_value: bookingValue,
        ride_distance: distance,
        driver_ratings: randomNumForDriver,
        customer_rating: 4.8,
        hour: now.getHours(),
        weekday: now.getDay(),
      };

      const prediction = await getPrediction(uberRide);
      console.log(prediction);

      const driver: Driver = {
        driver_name: driverName,
        vehicle_type: randomVehicle,
        pickup_location: pickUp,
        drop_location: drop,
        avg_vtat: vtat,
        avg_ctat: ctat,
        driver_rating: randomNumForDriver,
        booking_value: bookingValue,
        ride_distance: distance,
        prediction: prediction,
      };

      driversArray.push(driver);
    }

    setDriversData(driversArray);
  };

  useEffect(() => {
    if (routeRanges && payment && pickUp && drop) {
      generateDriversData();
    }
  }, [routeRanges, payment]);

  return (
    <>
      <Box>
        <Select
          placeholder="Select Route"
          required
          sx={{ minWidth: 200 }}
          onChange={handleRouteChange}
        >
          <Option value="route1">Rohini West - Sohna Road</Option>
          <Option value="route2">IMT Manesar - Subhash Chowk</Option>
          <Option value="route3">Bhiwadi - DLF City Court</Option>
          <Option value="route4">Rithala - Vatika Chowk</Option>
          <Option value="route5">Tagore Garden - Udyog Vihar</Option>
        </Select>

        <Select
          placeholder="Select payment methode"
          required
          sx={{ minWidth: 200 }}
          onChange={handlePaymentChange}
        >
          <Option value="upi">UPI</Option>
          <Option value="cash">Cash</Option>
          <Option value="credit_card">Credit Card</Option>
          <Option value="debit_card">Debit Card</Option>
          <Option value="uber_wallet">Uber Wallet</Option>
        </Select>
      </Box>
      <Box>
        {routeRanges &&
          payment &&
          driversData.map((driver) => {
            return <DriverCard driver={driver} key={driver.driver_name} />;
          })}
      </Box>
    </>
  );
};

export default DriverSearchPage;
