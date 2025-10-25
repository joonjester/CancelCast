import { useCallback } from "react";
import { Preditions, UberRide } from "../custom-types/custom-types";

const useApi = () => {
  const getPrediction = useCallback(async (uberRide: UberRide) => {
    try {
      const response = await fetch("http://localhost:5001/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uberRide),
      });

      if (!response.ok) {
        throw new Error("Failed get prediction");
      }

      const data = await response.json();
      return data as Preditions;
    } catch (error) {
      console.error("Error getting prediction: ", error);
      throw error;
    }
  }, []);

  return { getPrediction };
};

export default useApi;
