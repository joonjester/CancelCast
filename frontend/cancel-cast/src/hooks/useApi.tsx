import { useCallback } from "react";
import { UberRide } from "../custom-types/custom-types";

const useApi = () => {
  const getPrediction = useCallback(async (uberRide: UberRide) => {
    try {
      const response = await fetch(
        "http:// http://192.168.178.31:5001/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type:": "application/json",
          },
          body: JSON.stringify(uberRide),
        }
      );

      if (!response.ok) {
        throw new Error("Failed get prediction");
      }

      const data: string = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting prediction: ", error);
      throw error;
    }
  }, []);

  return getPrediction;
};

export default useApi;
