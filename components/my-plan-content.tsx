"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, Car, Map, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { db, auth } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { formatLocation } from "@/utils/format";
import { FlightPlans } from "./plan/flight-plans";
import { HotelPlans } from "./plan/hotel-plans";
import { CarPlans } from "./plan/car-plans";
import type { PlanItem, CityGroup } from "@/types/plans";

export function MyPlanContent() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const groupPlansByCity = (plans: PlanItem[]) => {
    const groups = plans.reduce((acc: { [key: string]: CityGroup }, plan) => {
      const destination =
        plan.flight?.destination || plan.hotel?.city || plan.car?.location;
      if (!acc[destination]) {
        acc[destination] = {
          city: formatLocation(destination).split(" (")[0],
          code: destination,
          flights: [],
          hotels: [],
          cars: [],
        };
      }

      if (plan.flight) acc[destination].flights.push(plan);
      if (plan.hotel) acc[destination].hotels.push(plan);
      if (plan.car) acc[destination].cars.push(plan);

      return acc;
    }, {});
    return Object.values(groups);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
        setPlans([]);
        setCityGroups([]);
        return;
      }

      const plansRef = ref(db, `plans/${user.uid}`);
      const unsubscribePlans = onValue(plansRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const plansArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...(value as any),
          }));
          setPlans(plansArray);
          setCityGroups(groupPlansByCity(plansArray));
        } else {
          setPlans([]);
          setCityGroups([]);
        }
        setLoading(false);
      });

      return () => unsubscribePlans();
    });

    return () => unsubscribeAuth();
  }, []);

  const handleRemovePlan = async (planId: string) => {
    try {
      if (!user) {
        toast.error("Please login first");
        return;
      }
      const planRef = ref(db, `plans/${user.uid}/${planId}`);
      await remove(planRef);
      toast.success("Plan removed successfully");
    } catch (error) {
      console.error("Error removing plan:", error);
      toast.error("Failed to remove plan");
    }
  };

  const renderEmptySection = (
    title: string,
    description: string,
    icon: React.ReactNode
  ) => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mx-auto w-12 h-12 flex items-center justify-center text-gray-400 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );

  const renderCityFilter = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedCity === null ? "default" : "outline"}
        size="xs"
        onClick={() => setSelectedCity(null)}
        className="text-xs py-1 h-7"
      >
        All Cities
      </Button>
      {cityGroups.map((group) => (
        <Button
          key={group.code}
          variant={selectedCity === group.code ? "default" : "outline"}
          size="xs"
          onClick={() => setSelectedCity(group.code)}
          className="text-xs py-1 h-7"
        >
          {group.city}
        </Button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-gray-500">Loading your travel plans...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return renderEmptySection(
      "Please Login First",
      "You need to be logged in to view your travel plans.",
      <Plane className="h-12 w-12" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
              My Travel Plans
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage all your travel arrangements in one place
            </p>
          </div>
          <Button
            size={isMobile ? "sm" : "default"}
            className="w-full md:w-auto bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Map className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">View Itinerary</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="relative grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger
            value="flights"
            className="flex items-center gap-2 py-3 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Plane className="h-5 w-5" />
            <span className="hidden md:inline text-base font-medium">
              Flights
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="hotels"
            className="flex items-center gap-2 py-3 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Hotel className="h-5 w-5" />
            <span className="hidden md:inline text-base font-medium">
              Hotels
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="cars"
            className="flex items-center gap-2 py-3 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Car className="h-5 w-5" />
            <span className="hidden md:inline text-base font-medium">
              Car Rental
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="mt-6">
          {renderCityFilter()}
          <FlightPlans
            cityGroups={cityGroups}
            selectedCity={selectedCity}
            onRemovePlan={handleRemovePlan}
            renderEmptySection={renderEmptySection}
          />
        </TabsContent>

        <TabsContent value="hotels" className="mt-6">
          {renderCityFilter()}
          <HotelPlans
            cityGroups={cityGroups}
            selectedCity={selectedCity}
            onRemovePlan={handleRemovePlan}
            renderEmptySection={renderEmptySection}
          />
        </TabsContent>

        <TabsContent value="cars" className="mt-6">
          {renderCityFilter()}
          <CarPlans
            cityGroups={cityGroups}
            selectedCity={selectedCity}
            onRemovePlan={handleRemovePlan}
            renderEmptySection={renderEmptySection}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
