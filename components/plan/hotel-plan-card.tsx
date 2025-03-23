import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Trash2, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HotelPlan {
  id: string;
  hotelName: string;
  description: string;
  checkInTime: string;
  checkOutTime: string;
  ratePerNight: string;
  rating: number;
  mainImage: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  destination?: string;
}

interface HotelPlanCardProps {
  plan: HotelPlan;
  onRemove: () => Promise<void>;
}

export function HotelPlanCard({ plan, onRemove }: HotelPlanCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await onRemove();
    } catch (error) {
      console.error("Error removing plan:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48">
        {plan.mainImage ? (
          <Image
            src={plan.mainImage}
            alt={plan.hotelName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}

        {/* Rating Badge */}
        {plan.rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium">
                {plan.rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Check-in/Check-out */}
        {(plan.checkInDate || plan.checkOutDate) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-6 pb-2 px-3 text-white">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs opacity-90 font-medium">Check-in</span>
                <span className="text-sm font-semibold">
                  {formatDate(plan.checkInDate)}
                </span>
              </div>
              <div className="h-6 border-r border-white/30 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-xs opacity-90 font-medium">
                  Check-out
                </span>
                <span className="text-sm font-semibold">
                  {formatDate(plan.checkOutDate)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Hotel Name and Details */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {plan.hotelName}
          </h3>
          {plan.destination && (
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              {plan.destination}
            </p>
          )}
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {plan.description}
          </p>
        </div>

        {/* Times */}
        <div className="flex flex-wrap gap-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Check-in: {plan.checkInTime}
          </span>
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Check-out: {plan.checkOutTime}
          </span>
        </div>

        {/* Price and Remove Button */}
        <div className="flex justify-between items-center pt-2">
          <div>
            <p className="text-lg font-bold text-primary">
              {plan.ratePerNight}
            </p>
            <p className="text-xs text-gray-500">per night</p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Hotel Plan</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this hotel from your plans?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
