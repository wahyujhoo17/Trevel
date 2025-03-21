import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Image from "next/image";

interface HotelPlanCardProps {
  hotel: {
    id: string;
    name: string;
    image: string;
    location: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    price: number;
  };
  onRemove: (id: string) => void;
}

export function HotelPlanCard({ hotel, onRemove }: HotelPlanCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{hotel.name}</h3>
          <p className="text-sm text-gray-500">{hotel.location}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p>Check-in: {format(new Date(hotel.checkIn), "MMM d, yyyy")}</p>
          <p>Check-out: {format(new Date(hotel.checkOut), "MMM d, yyyy")}</p>
          <p>Room: {hotel.roomType}</p>
          <p className="font-semibold">${hotel.price.toFixed(2)}</p>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full"
          onClick={() => onRemove(hotel.id)}
        >
          Remove from Plan
        </Button>
      </div>
    </Card>
  );
}