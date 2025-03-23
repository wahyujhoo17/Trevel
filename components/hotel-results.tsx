import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SearchX,
  Star,
  StarHalf,
  MapPin,
  Users,
  Loader2,
  Wifi,
  Coffee,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Badge } from "@/components/ui/badge";
import { useState, ReactElement } from "react";
import { HotelDetailModal } from "@/components/hotel-detail-modal";
import { Hotel } from "@/types/hotel";

interface HotelResultsProps {
  hotels: Hotel[];
  isLoading: boolean;
  hasSearched: boolean;
  selectedDates?: {
    from: Date;
    to: Date;
  };
  onHotelSelect: (hotel: Hotel) => void;
}

// Map of common amenities to icons
const amenityIcons: Record<string, ReactElement> = {
  "Free Wi-Fi": <Wifi className="h-3 w-3 mr-1" />,
  "Free breakfast": <Coffee className="h-3 w-3 mr-1" />,
  Restaurant: <Utensils className="h-3 w-3 mr-1" />,
};

// Function to render star rating
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-4 w-4 text-yellow-400 fill-yellow-400"
        />
      ))}

      {/* Half star if needed */}
      {hasHalfStar && (
        <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400" />
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
};

// Function to get rating text
const getRatingText = (rating: number): { text: string; color: string } => {
  if (rating >= 4.5) return { text: "Exceptional", color: "text-green-600" };
  if (rating >= 4) return { text: "Excellent", color: "text-green-500" };
  if (rating >= 3.5) return { text: "Very Good", color: "text-blue-500" };
  if (rating >= 3) return { text: "Good", color: "text-blue-400" };
  if (rating >= 2) return { text: "Average", color: "text-yellow-500" };
  return { text: "Poor", color: "text-red-500" };
};

export function HotelResults({
  hotels,
  isLoading,
  hasSearched,
  selectedDates,
  onHotelSelect,
}: HotelResultsProps) {
  // Update to just pass the hotel to the parent
  const handleViewDetails = (hotel: Hotel) => {
    onHotelSelect(hotel);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!Array.isArray(hotels)) {
    // console.error("Invalid hotels data:", hotels);
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-gray-100 p-3">
            <SearchX className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Error Loading Hotels</h3>
            <p className="text-sm text-gray-500">
              There was a problem loading the hotel data.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (hasSearched && hotels.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-gray-100 p-3">
            <SearchX className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Hotels Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              We couldn&apos;t find any hotels matching your criteria. Try
              adjusting your search parameters.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Render hotels grid only if we have valid data
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel, index) => {
          const ratingInfo = getRatingText(hotel.overall_rating);

          return (
            <Card
              key={index}
              className="overflow-hidden group hover:shadow-lg transition-shadow border border-gray-200"
            >
              {/* Hotel Images Carousel */}
              <div className="relative h-48">
                {hotel.images && hotel.images.length > 0 ? (
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    className="h-full"
                  >
                    {hotel.images.map((image, idx) => (
                      <SwiperSlide key={idx}>
                        <Image
                          src={image}
                          alt={`${hotel.name} - Image ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}

                {/* Check-in/Check-out Info - IMPROVED */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-6 pb-2 px-3 text-white z-10">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs opacity-90 font-medium">
                        Check-in
                      </span>
                      <span className="text-sm font-semibold">
                        {hotel.check_in_time}
                      </span>
                    </div>
                    <div className="h-6 border-r border-white/30 mx-2"></div>
                    <div className="flex flex-col">
                      <span className="text-xs opacity-90 font-medium">
                        Check-out
                      </span>
                      <span className="text-sm font-semibold">
                        {hotel.check_out_time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Hotel Name and Description */}
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">
                      {hotel.name}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {hotel.description}
                  </p>
                </div>

                {/* Enhanced Rating Section */}
                {hotel.overall_rating > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <StarRating rating={hotel.overall_rating} />
                      <span
                        className={`text-xs font-medium ${ratingInfo.color}`}
                      >
                        {ratingInfo.text}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Based on {hotel.reviews} guest reviews
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                      >
                        {amenityIcons[amenity] || null}
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                        +{hotel.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {hotel.rate_per_night}
                    </p>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-5"
                    onClick={() => handleViewDetails(hotel)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

// Export komponen StarRating agar dapat digunakan di hotel-detail-modal
export { StarRating };
