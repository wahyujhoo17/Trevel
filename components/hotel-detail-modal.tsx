"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/hotel-results";
import { ref, push, set, serverTimestamp } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Loader2,
  ExternalLink,
  X,
  Clock,
  ArrowRight,
  BookOpen,
  Heart,
  Share,
  Coffee,
  Utensils,
  Wifi,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { locations } from "@/data/locations";

interface HotelDetailModalProps {
  hotel: {
    name: string;
    images?: string[];
    description?: string;
    rate_per_night: string;
    amenities?: string[];
    overall_rating: number;
    reviews: number;
    gps_coordinates?: string;
    check_in_time: string;
    check_out_time: string;
    link?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDates?: {
    from: Date;
    to: Date;
  };
  destination?: string; // This is the airport code
}

export function HotelDetailModal({
  hotel,
  isOpen,
  onClose,
  selectedDates,
  destination,
}: HotelDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  // Add this check for authentication
  const user = auth.currentUser;

  // Calculate number of nights
  const numberOfNights = useMemo(() => {
    if (!selectedDates?.from || !selectedDates?.to) return 0;
    return Math.ceil(
      (selectedDates.to.getTime() - selectedDates.from.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }, [selectedDates]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    if (!hotel?.rate_per_night || !numberOfNights) return null;

    const rate = hotel.rate_per_night.replace(/[^\d]/g, "");
    if (!rate) return null;

    const numRate = parseFloat(rate);
    return isNaN(numRate) ? null : numRate * numberOfNights;
  }, [hotel?.rate_per_night, numberOfNights]);

  // Add debug logging
  useEffect(() => {
    // console.log("Selected dates in modal:", selectedDates);
  }, [selectedDates]);

  const handleClose = () => {
    setIsSubmitting(false);
    setIsAdded(false);
    setActiveIndex(0);
    setShowMore(false);
    onClose();
  };

  // Get city name from location code
  const getCityFromCode = useMemo(() => {
    if (!destination) return "Bali";

    const location = locations.find((loc) => loc.code === destination);
    return location ? location.city : "Bali";
  }, [destination]);

  // Add to plan function with improved error handling
  const addToMyPlan = async () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to add hotels to your plan",
      });
      return;
    }

    if (!selectedDates?.from || !selectedDates?.to) {
      toast.error("Date selection required", {
        description: "Please select check-in and check-out dates",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const planData = {
        type: "hotel",
        userId: user.uid,
        hotelName: hotel.name,
        mainImage: hotel.images?.[0] || null,
        description: hotel.description,
        checkInDate: selectedDates.from.toISOString(),
        checkOutDate: selectedDates.to.toISOString(),
        checkInTime: hotel.check_in_time,
        checkOutTime: hotel.check_out_time,
        ratePerNight: hotel.rate_per_night,
        code: destination || "DPS",
        city: getCityFromCode, // Use the city name from location data
        amenities: hotel.amenities || [],
        createdAt: serverTimestamp(),
        numberOfNights: numberOfNights,
        totalCost: totalCost || undefined,
        rating: hotel.overall_rating,
      };

      // Add to Firebase
      const plansRef = ref(db, `plans/${user.uid}`);
      const newPlanRef = push(plansRef);
      await set(newPlanRef, planData);

      setIsAdded(true);
      toast.success("Hotel added to plan", {
        description: "You can view it in My Plans section",
      });

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      // console.error("Error adding hotel to plan:", error);
      toast.error("Failed to add hotel", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return early if no hotel
  if (!hotel) return null;

  // Map common amenities to icons
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes("wifi"))
      return <Wifi className="h-3.5 w-3.5 mr-1.5" />;
    if (lowerAmenity.includes("breakfast"))
      return <Coffee className="h-3.5 w-3.5 mr-1.5" />;
    if (lowerAmenity.includes("restaurant"))
      return <Utensils className="h-3.5 w-3.5 mr-1.5" />;
    return <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" />;
  };

  // Format description
  const shortDescription =
    hotel.description && hotel.description.length > 300
      ? hotel.description.substring(0, 300) + "..."
      : hotel.description;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-3xl p-0 h-[92vh] md:h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-xl"
        onEscapeKeyDown={handleClose}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{hotel.name}</DialogTitle>
          <DialogDescription>Hotel Details</DialogDescription>
        </DialogHeader>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-600 shadow-md hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image Gallery with improved controls */}
        <div className="relative h-[30vh] sm:h-[35vh] w-full bg-gray-100">
          {hotel.images && hotel.images.length > 0 ? (
            <>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                loop
                className="h-full rounded-t-xl"
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              >
                {hotel.images.map((image, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative h-full w-full">
                      <Image
                        src={image}
                        alt={`${hotel.name} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 900px"
                        priority={idx === 0}
                        quality={85}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                {activeIndex + 1}/{hotel.images.length}
              </div>
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-400">No images available</p>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 sm:px-6 py-5 space-y-5 sm:space-y-6">
            {/* Header with improved layout for mobile */}
            <div className="space-y-3">
              <div className="flex items-start flex-col sm:flex-row sm:justify-between sm:gap-4">
                <div className="flex-1 w-full sm:w-auto">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                    {hotel.name}
                  </h2>
                  <div className="flex flex-wrap items-center mt-2 gap-2">
                    <div className="flex items-center">
                      <StarRating rating={hotel.overall_rating} />
                      <span className="ml-2 text-sm text-gray-500">
                        {hotel.reviews} reviews
                      </span>
                    </div>
                    {hotel.gps_coordinates && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mx-2 text-gray-300 hidden sm:inline">
                          •
                        </span>
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        <span>{getCityFromCode}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Price display - better sized for mobile */}
                <div className="mt-3 sm:mt-0 w-full sm:w-auto">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 flex flex-col items-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {hotel.rate_per_night}
                    </p>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive date display */}
            {selectedDates?.from && selectedDates?.to && (
              <div className="bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Check-in</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {format(selectedDates.from, "EEE, MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-blue-600 mt-0.5">
                      From {hotel.check_in_time}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <ArrowRight className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 mt-4 sm:mt-0">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Check-out</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {format(selectedDates.to, "EEE, MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-blue-600 mt-0.5">
                      Until {hotel.check_out_time}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">{numberOfNights}</span>{" "}
                        night{numberOfNights !== 1 ? "s" : ""} stay
                      </p>
                    </div>
                    <div className="bg-blue-500/10 px-3 py-1.5 rounded-md">
                      <p className="text-sm font-semibold text-blue-800">
                        Total:{" "}
                        {totalCost
                          ? new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }).format(totalCost)
                          : hotel.rate_per_night.replace(/\/night$/, "") +
                            " × " +
                            numberOfNights}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description with read more/less */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                About this property
              </h3>
              <div className="text-gray-600 text-sm leading-relaxed">
                {hotel.description && hotel.description.length > 300 ? (
                  <>
                    <p>{showMore ? hotel.description : shortDescription}</p>
                    <button
                      onClick={() => setShowMore(!showMore)}
                      className="text-primary font-medium mt-2 hover:underline"
                    >
                      {showMore ? "Show less" : "Read more"}
                    </button>
                  </>
                ) : (
                  <p>{hotel.description}</p>
                )}
              </div>
            </div>

            {/* Check-in/Check-out Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Check-in Card */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <Clock className="h-4 w-4 text-primary mr-2" />
                    Check-in
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    From
                  </Badge>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {hotel.check_in_time}
                </p>
              </div>

              {/* Check-out Card */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <Clock className="h-4 w-4 text-primary mr-2" />
                    Check-out
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-red-50 text-red-600 border-red-100"
                  >
                    Until
                  </Badge>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {hotel.check_out_time}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h3 className="text-base font-medium mb-3">
                What this place offers
              </h3>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities && hotel.amenities.length > 0 ? (
                  hotel.amenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="outline"
                      className="bg-white text-gray-700 border-gray-200 flex items-center text-xs py-1.5 px-3 hover:bg-gray-50"
                    >
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No amenities listed</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at Bottom with improved mobile layout */}
        <div className="border-t bg-white/95 backdrop-blur-sm">
          <DialogFooter className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2 p-3 sm:p-4">
            <Button
              variant="outline"
              size="default"
              onClick={() =>
                window.open(
                  hotel.link ||
                    `https://www.google.com/search?q=${encodeURIComponent(
                      hotel.name + " " + getCityFromCode
                    )}`,
                  "_blank"
                )
              }
              className="text-gray-700 border-gray-300 hover:bg-gray-50 py-2 h-auto"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              <span>Visit Website</span>
            </Button>
            <Button
              onClick={addToMyPlan}
              size="default"
              className={cn(
                "font-medium flex-1 py-2 h-auto",
                isAdded && "bg-green-600 hover:bg-green-700"
              )}
              disabled={isSubmitting || isAdded}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </span>
              ) : isAdded ? (
                <span className="flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Added to My Plan
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to My Plan
                </span>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
