"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Plane as PlanePilot, MapPin, Calendar, Activity } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

const popularDestinations = [
  {
    id: 1,
    name: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
    description: "Experience paradise with pristine beaches and rich culture",
  },
  {
    id: 2,
    name: "Bangkok, Thailand",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=800",
    description: "Vibrant city life meets ancient temples",
  },
  {
    id: 3,
    name: "Ha Long Bay, Vietnam",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800",
    description: "Stunning limestone islands in emerald waters",
  },
];

export default function Home() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState({ from: undefined, to: undefined });

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[90vh] flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&q=80&w=1920"
          alt="Southeast Asia Travel"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Discover Southeast Asia
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Plan your perfect adventure with AI-powered itineraries and local insights
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Start Planning Your Trip
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <section className="max-w-6xl mx-auto -mt-20 relative z-20 px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Where to?"
                className="pl-10"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>
            <Button className="h-full bg-primary hover:bg-primary/90">
              <PlanePilot className="mr-2" /> Search
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold mb-8">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularDestinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden group cursor-pointer">
              <div className="relative h-64">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{destination.name}</h3>
                <p className="text-gray-600">{destination.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}