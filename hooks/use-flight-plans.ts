import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db, auth } from "@/lib/firebase";

export function useFlightPlans() {
  const [flightDate, setFlightDate] = useState<{
    departureDate: Date;
    returnDate: Date;
  } | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const flightRef = ref(db, `plans/${user.uid}/flights`);

    const unsubscribe = onValue(flightRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get the most recent flight plan
        const latestFlight = Object.values(data)[0] as any;
        setFlightDate({
          departureDate: new Date(latestFlight.departureDate),
          returnDate: new Date(latestFlight.returnDate),
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { flightDate };
}
