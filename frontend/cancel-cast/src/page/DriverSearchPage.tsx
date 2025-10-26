import DriverCard from "../components/DriverCard";
import { Select, Option, Box } from "@mui/joy";
import { Driver, UberRide } from "../custom-types/custom-types";
import useApi from "../hooks/useApi";
import { useEffect, useState } from "react";

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
  const [driversData, setDriversData] = useState<Driver[]>([]);

  const drivers = [
    "Whisker McClaw",
    "Tabby Pawsworth",
    "Clawdia Scratch",
    "Felix Meowser",
    "Luna Whipstail",
    "Sven",
  ];

  const vehicle = ["Go Mini", "Go Sedan", "Premier Sedan", "Ubere XL", "Auto"];

  const handleRouteChange = (newValue: string | null) => {
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

  const handlePaymentChange = (newValue: string | null) => {
    if (!newValue) return;
    setPayment(newValue);
  };

  const forceDriver = async (driver: UberRide, driverName: string) => {
    const uberRide: UberRide = {
      vehicle_type: driver.vehicle_type,
      pickup_location: pickUp,
      drop_location: drop,
      payment_method: payment,
      avg_vtat: driver.avg_vtat,
      avg_ctat: driver.avg_ctat,
      booking_value: driver.booking_value,
      ride_distance: driver.ride_distance,
      driver_ratings: driver.driver_ratings,
      customer_rating: 4.8,
      hour: driver.hour,
      weekday: driver.weekday,
    };

    const prediction = await getPrediction(uberRide);
    console.log(prediction);

    const newDriver: Driver = {
      driver_name: driverName,
      vehicle_type: driver.vehicle_type,
      pickup_location: pickUp,
      drop_location: drop,
      avg_vtat: driver.avg_vtat,
      avg_ctat: driver.avg_ctat,
      driver_rating: driver.driver_ratings,
      booking_value: driver.booking_value,
      ride_distance: driver.ride_distance,
      predictionLogReg: prediction.prediction_logreg,
      predictionRf: prediction.prediction_rf,
    };

    return newDriver;
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
        predictionLogReg: prediction.prediction_logreg,
        predictionRf: prediction.prediction_rf,
      };

      driversArray.push(driver);
    }

    // change for specific driver
    const date = new Date("2025-5-2T15:30:00");
    const testDriver: UberRide = {
      vehicle_type: "Auto",
      pickup_location: pickUp,
      drop_location: drop,
      avg_vtat: 15,
      avg_ctat: 30,
      driver_ratings: 5,
      booking_value: 200,
      ride_distance: 20,
      payment_method: payment,
      customer_rating: 5,
      hour: date.getHours(),
      weekday: date.getDay(),
    };

    const newDriver = await forceDriver(testDriver, "Jakob");

    driversArray.push(newDriver);

    setDriversData(driversArray);
  };

  useEffect(() => {
    if (routeRanges && payment && pickUp && drop) {
      generateDriversData();
    }
  }, [routeRanges, payment]);

  return (
    <Box>
      <Box display={"flex"}>
        <Box sx={{ paddingRight: 3 }}>
          <Select
            placeholder="Select Route"
            required
            sx={{ minWidth: 200 }}
            onChange={(_, newValue) =>
              handleRouteChange(newValue as string | null)
            }
          >
            <Option value="route1">Rohini West - Sohna Road</Option>
            <Option value="route2">IMT Manesar - Subhash Chowk</Option>
            <Option value="route3">Bhiwadi - DLF City Court</Option>
            <Option value="route4">Rithala - Vatika Chowk</Option>
            <Option value="route5">Tagore Garden - Udyog Vihar</Option>
          </Select>
        </Box>
        <Select
          placeholder="Select payment methode"
          required
          sx={{ minWidth: 200 }}
          onChange={(_, newValue) =>
            handlePaymentChange(newValue as string | null)
          }
        >
          <Option value="upi">UPI</Option>
          <Option value="cash">Cash</Option>
          <Option value="credit_card">Credit Card</Option>
          <Option value="debit_card">Debit Card</Option>
          <Option value="uber_wallet">Uber Wallet</Option>
        </Select>
      </Box>
      <Box
        sx={{ paddingTop: 3 }}
        display={"grid"}
        gap={3}
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      >
        {routeRanges &&
          payment &&
          driversData.map((driver) => (
            <DriverCard driver={driver} key={driver.driver_name} />
          ))}
      </Box>
    </Box>
  );
};

export default DriverSearchPage;
