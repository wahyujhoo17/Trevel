import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db, auth } from "@/lib/firebase";

interface FlightPlan {
  departureDate: Date;
  returnDate: Date;
}

export function useFlightPlans() {
  const [flightDate, setFlightDate] = useState<FlightPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const flightRef = ref(db, `plans/${user.uid}/flights`);

    try {
      const unsubscribe = onValue(
        flightRef,
        (snapshot) => {
          const data = snapshot.val();
          setIsLoading(false);

          if (!data) {
            setFlightDate(null);
            return;
          }

          // Get the most recent flight plan
          const flights = Object.values(data);
          const latestFlight = flights[flights.length - 1] as any;

          if (latestFlight?.departureDate && latestFlight?.returnDate) {
            setFlightDate({
              departureDate: new Date(latestFlight.departureDate),
              returnDate: new Date(latestFlight.returnDate),
            });
          }
        },
        (error) => {
          console.error("Error fetching flight plans:", error);
          setError(error.message);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up flight plans listener:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setIsLoading(false);
    }
  }, []);

  return { flightDate, isLoading, error };
}
