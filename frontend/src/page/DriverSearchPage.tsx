import DriverCard from "../components/DriverCard";
import { Select, Option, Box, Input } from "@mui/joy";
import { Driver, UberRide } from "../custom-types/custom-types";
import useApi from "../hooks/useApi";
import { useEffect, useState } from "react";

const DriverSearchPage = () => {
  const { getPrediction } = useApi();
  const [pickUp, setPickUp] = useState("");
  const [drop, setDrop] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [routeRanges, setRouteRanges] = useState<{
    vtatMin: number;
    vtatMax: number;
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

  // Generate hours array (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleRouteChange = (newValue: string | null) => {
    if (!newValue) return;

    switch (newValue) {
      case "route1": {
        setRouteRanges({
          vtatMin: 2,
          vtatMax: 12,
        });
        setPickUp("Rohini West");
        setDrop("Sohna Road");
        break;
      }

      case "route2": {
        setRouteRanges({
          vtatMin: 3,
          vtatMax: 16,
        });
        setPickUp("IMT Manesar");
        setDrop("Subhash Chowk");
        break;
      }

      case "route3": {
        setRouteRanges({
          vtatMin: 5,
          vtatMax: 17,
        });
        setPickUp("Bhiwadi");
        setDrop("DLF City Court");
        break;
      }

      case "route4": {
        setRouteRanges({
          vtatMin: 5,
          vtatMax: 17,
        });
        setPickUp("Rithala");
        setDrop("Vatika Chowk");
        break;
      }

      case "route5": {
        setRouteRanges({
          vtatMin: 5,
          vtatMax: 16,
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

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleHourChange = (newValue: string | null) => {
    if (newValue !== null) {
      setSelectedHour(parseInt(newValue));
    }
  };

  const generateDriversData = async () => {
    if (!routeRanges || !selectedDate || selectedHour === null) return;

    const dateObj = new Date(selectedDate + "T00:00:00");
    const driversArray: Driver[] = [];

    for (const driverName of drivers) {
      const vtat =
        Math.floor(
          Math.random() * (routeRanges.vtatMax - routeRanges.vtatMin + 1)
        ) + routeRanges.vtatMin;

      const randomNum = Math.floor(Math.random() * 4);
      const randomVehicle = vehicle[randomNum];

      const uberRide: UberRide = {
        vehicle_type: randomVehicle,
        pickup_location: pickUp,
        drop_location: drop,
        avg_vtat: vtat,
        hour: selectedHour,
        month: dateObj.getMonth(),
        weekday: dateObj.getDay(),
      };

      const prediction = await getPrediction(uberRide);

      const driver: Driver = {
        driver_name: driverName,
        vehicle_type: randomVehicle,
        pickup_location: pickUp,
        drop_location: drop,
        avg_vtat: vtat,
        date: `${dateObj.toLocaleDateString()}`,
        hour: `${selectedHour}:00Uhr`,
        prediction: prediction.prediction,
      };

      driversArray.push(driver);
    }

    // change for specific driver
    const date = new Date("2025-05-02T15:30:00");
    const testDriver: UberRide = {
      vehicle_type: "Auto",
      pickup_location: pickUp,
      drop_location: drop,
      avg_vtat: 15,
      hour: date.getHours(),
      month: date.getMonth(),
      weekday: date.getDay(),
    };

    setDriversData(driversArray);
  };

  useEffect(() => {
    if (
      routeRanges &&
      pickUp &&
      drop &&
      selectedDate &&
      selectedHour !== null
    ) {
      generateDriversData();
    }
  }, [routeRanges, selectedDate, selectedHour]);

  return (
    <Box>
      <Box display={"flex"} gap={2} flexWrap={"wrap"}>
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

        <Input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          sx={{ minWidth: 200 }}
          required
        />

        <Select
          placeholder="Select hour"
          required
          sx={{ minWidth: 150 }}
          onChange={(_, newValue) =>
            handleHourChange(newValue as string | null)
          }
        >
          {hours.map((hour) => (
            <Option key={hour} value={hour.toString()}>
              {hour.toString().padStart(2, "0")}:00
            </Option>
          ))}
        </Select>
      </Box>
      <Box
        sx={{ paddingTop: 3 }}
        display={"grid"}
        gap={3}
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      >
        {routeRanges &&
          selectedDate &&
          selectedHour !== null &&
          driversData.map((driver) => (
            <DriverCard driver={driver} key={driver.driver_name} />
          ))}
      </Box>
    </Box>
  );
};

export default DriverSearchPage;
