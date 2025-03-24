"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  MapPin,
  Star,
  Calendar,
  Plus,
  Hotel,
  Map,
  Clock,
  ChevronRight,
  Wifi,
  Coffee,
  Utensils,
  Tag,
  CreditCard,
  Building,
} from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/utils/format";
import type { CityGroup, PlanItem } from "@/types/plans";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import { motion } from "framer-motion";
import PaymentModal from "@/components/payment/payment-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

interface HotelPlansProps {
  cityGroups: CityGroup[];
  selectedCity: string | null;
  onRemovePlan: (id: string) => Promise<void>;
  renderEmptySection: (
    title: string,
    description: string,
    icon: React.ReactNode
  ) => JSX.Element;
}

// Map of common amenities to icons
const amenityIcons: Record<string, JSX.Element> = {
  wifi: <Wifi className="h-3.5 w-3.5" />,
  breakfast: <Coffee className="h-3.5 w-3.5" />,
  restaurant: <Utensils className="h-3.5 w-3.5" />,
};

export function HotelPlans({
  cityGroups,
  selectedCity,
  onRemovePlan,
  renderEmptySection,
}: HotelPlansProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<PlanItem | null>(null);
  const [hotelToDelete, setHotelToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredGroups = selectedCity
    ? cityGroups.filter((group) => group.code === selectedCity)
    : cityGroups;

  const allHotels = filteredGroups.reduce((acc, group) => {
    return acc.concat(group.hotels || []);
  }, [] as PlanItem[]);

  const toggleExpandHotel = (id: string) => {
    setExpandedHotel(expandedHotel === id ? null : id);
  };

  const handleBooking = (hotel: PlanItem) => {
    setSelectedHotel(hotel);
    setShowPaymentModal(true);
  };

  const calculateTotalCost = (hotel: PlanItem): number => {
    if (!hotel.checkInDate || !hotel.checkOutDate || !hotel.ratePerNight)
      return 0;

    const nights = calculateNights(hotel.checkInDate, hotel.checkOutDate);
    const rate = parseFloat(hotel.ratePerNight.replace(/[^0-9.]/g, ""));

    return nights * rate;
  };

  const handleDeleteClick = (hotelId: string, hotelName: string) => {
    setHotelToDelete({ id: hotelId, name: hotelName });
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (hotelToDelete) {
      try {
        await onRemovePlan(hotelToDelete.id);

        // Fix for toast - use the correct variant
        toast({
          title: "Hotel removed successfully",
          description: `${hotelToDelete.name} has been removed from your plans.`,
        });
      } catch (error) {
        toast({
          title: "Error removing hotel",
          description: "Failed to remove hotel. Please try again.",
          variant: "destructive",
        });
      }
      setIsDeleteAlertOpen(false);
      setHotelToDelete(null);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration issues by not rendering until client-side
  }

  const filteredCities = filteredGroups.filter(
    (city) => city.hotels.length > 0
  );

  // Helper function to get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes("wifi")) return amenityIcons.wifi;
    if (lowerAmenity.includes("breakfast")) return amenityIcons.breakfast;
    if (lowerAmenity.includes("restaurant")) return amenityIcons.restaurant;
    return null;
  };

  // Calculate nights between dates
  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Your Hotel Plans
        </h2>
        <Button
          variant="outline"
          className="group hover:border-primary/80"
          onClick={() => router.push("/hotels")}
        >
          <Plus className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-gray-600 group-hover:text-primary">
            Add Hotel
          </span>
        </Button>
      </div>

      {/* Content */}
      {allHotels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16"
        >
          {renderEmptySection(
            "No Hotel Bookings Yet",
            "Find and book the perfect accommodation for your trip.",
            <Hotel className="h-16 w-16" />
          )}
          <div className="mt-6">
            <Button
              className="mx-auto bg-primary/90 hover:bg-primary"
              onClick={() => router.push("/hotels")}
            >
              <Hotel className="h-4 w-4 mr-2" />
              Browse Hotels
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {filteredCities.map((group) => (
            <motion.div
              key={group.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2.5 mb-3 pb-2 border-b">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {group.city}
                </h3>
                <Badge
                  variant="outline"
                  className="ml-2 bg-gray-50 text-gray-600"
                >
                  {group.hotels?.length || 0} hotels
                </Badge>
              </div>

              <div className="grid gap-5">
                {group.hotels?.map((hotel) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-all border-gray-200 group">
                      <div className="flex flex-col md:flex-row">
                        {/* Hotel Image with improved sizing */}
                        <div className="w-full md:w-56 h-52 md:h-auto relative shrink-0 overflow-hidden">
                          {hotel.mainImage ? (
                            <Image
                              src={hotel.mainImage}
                              alt={hotel.hotelName || "Hotel image"}
                              fill
                              sizes="(max-width: 768px) 100vw, 224px"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Hotel className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Hotel Details with modern layout */}
                        <div className="flex-1 p-5">
                          <div className="flex flex-col h-full">
                            {/* Header info */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">
                                  {hotel.hotelName || "Unknown Hotel"}
                                </h4>

                                {/* Rating */}
                                {hotel.rating && (
                                  <div className="flex items-center mt-1.5 gap-1">
                                    {[
                                      ...Array(
                                        Math.min(
                                          5,
                                          Math.floor(hotel.rating || 0)
                                        )
                                      ),
                                    ].map((_, i) => (
                                      <Star
                                        key={i}
                                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                      />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">
                                      ({hotel.rating}/5)
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Price card */}
                              <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/10 text-right">
                                {hotel.ratePerNight && (
                                  <>
                                    <p className="font-bold text-primary text-lg">
                                      {hotel.ratePerNight}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      per night
                                    </p>
                                  </>
                                )}
                                {hotel.checkInDate && hotel.checkOutDate && (
                                  <Badge className="mt-1.5 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">
                                    {calculateNights(
                                      hotel.checkInDate,
                                      hotel.checkOutDate
                                    )}{" "}
                                    nights
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {/* Short description */}
                            {hotel.description && (
                              <p className="text-sm text-gray-600 mt-2.5 line-clamp-2">
                                {hotel.description}
                              </p>
                            )}
                            {/* Location and Dates */}
                            <div className="mt-4 mb-1.5 flex flex-wrap gap-x-4 gap-y-2.5">
                              {/* Location */}
                              {hotel.city && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                                  <span>{hotel.city}</span>
                                </div>
                              )}

                              {/* Check-in */}
                              {hotel.checkInDate && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-1.5 text-primary" />
                                  <span>
                                    Check-in: {formatDate(hotel.checkInDate)}
                                  </span>
                                </div>
                              )}

                              {/* Check-out */}
                              {hotel.checkOutDate && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-1.5 text-primary" />
                                  <span>
                                    Check-out: {formatDate(hotel.checkOutDate)}
                                  </span>
                                </div>
                              )}

                              {/* Check-in time */}
                              {hotel.checkInTime && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-4 w-4 mr-1.5 text-primary" />
                                  <span>From {hotel.checkInTime}</span>
                                </div>
                              )}
                            </div>

                            {/* Amenities preview */}
                            {Array.isArray(hotel.amenities) &&
                              hotel.amenities.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {hotel.amenities
                                    .slice(
                                      0,
                                      expandedHotel === hotel.id ? undefined : 3
                                    )
                                    .map((amenity, i) => (
                                      <Badge
                                        key={`${hotel.id}-amenity-${i}`}
                                        variant="outline"
                                        className="bg-gray-50 text-gray-700 text-xs py-0.5"
                                      >
                                        {getAmenityIcon(amenity)}
                                        <span className="ml-1">{amenity}</span>
                                      </Badge>
                                    ))}
                                  {hotel.amenities.length > 3 &&
                                    expandedHotel !== hotel.id && (
                                      <Badge
                                        variant="outline"
                                        className="bg-gray-50 text-primary hover:bg-gray-100 cursor-pointer"
                                        onClick={() =>
                                          toggleExpandHotel(hotel.id)
                                        }
                                      >
                                        +{hotel.amenities.length - 3} more
                                      </Badge>
                                    )}
                                </div>
                              )}
                            <div className="mt-3 flex justify-end">
                              {/* Details toggle button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpandHotel(hotel.id)}
                                className="text-gray-500 hover:text-gray-700 order-3 sm:order-1"
                              >
                                {expandedHotel === hotel.id
                                  ? "Less details"
                                  : "More details"}
                                <ChevronRight
                                  className={`h-4 w-4 ml-1 transition-transform ${
                                    expandedHotel === hotel.id
                                      ? "rotate-90"
                                      : ""
                                  }`}
                                />
                              </Button>
                            </div>
                            {/* Action Buttons */}
                            <div className="mt-4 pt-4 border-t flex flex-wrap justify-end items-center gap-y-3">
                              {/* Total cost info */}
                              <div className="flex items-center mr-5">
                                <Tag className="h-4 w-4 mr-1.5 text-green-600" />
                                <span className="text-sm font-medium text-gray-800">
                                  Total: ${calculateTotalCost(hotel)}
                                </span>
                              </div>

                              {/* Controls - Better organized */}
                              <div className="m-2 flex items-center gap-2">
                                {/* Remove button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick(
                                      hotel.id,
                                      hotel.hotelName || "this hotel"
                                    )
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>

                                {/* Book Now button - Pindah ke kanan di mobile */}
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleBooking(hotel)}
                                  className="bg-primary hover:bg-primary/90 text-white ml-auto sm:ml-0"
                                >
                                  <CreditCard className="h-4 w-4 mr-1.5" />
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {selectedHotel && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedHotel(null);
          }}
          amount={calculateTotalCost(selectedHotel)}
          itemType="hotel"
          itemDetails={{
            name: selectedHotel.hotelName || "",
            checkIn: selectedHotel.checkInDate,
            checkOut: selectedHotel.checkOutDate,
            nights: calculateNights(
              selectedHotel.checkInDate || "",
              selectedHotel.checkOutDate || ""
            ),
            ratePerNight: selectedHotel.ratePerNight,
            destination: selectedHotel.city,
            image: selectedHotel.mainImage,
          }}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-5 w-5" />
              </div>
              <AlertDialogTitle className="text-lg">
                Remove Hotel
              </AlertDialogTitle>
            </div>

            <AlertDialogDescription className="pt-3 space-y-3">
              {/* Hotel Information Box */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                  {hotelToDelete?.name &&
                  hotelToDelete.name !== "this hotel" ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Hotel className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <Building className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {hotelToDelete?.name || "Unknown Hotel"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hotel Accommodation
                  </p>
                </div>
              </div>

              <p>Are you sure you want to remove this hotel from your plans?</p>

              {/* Warning Box */}
              <div className="bg-amber-50 border border-amber-100 rounded-md p-2.5 text-amber-800 flex items-start gap-2">
                <div className="mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p className="text-sm">
                  This action cannot be undone and your booking information will
                  be permanently removed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 border-gray-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Remove Hotel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
