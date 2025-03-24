import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import {
  CreditCard,
  Wallet,
  QrCode,
  Smartphone,
  Building,
  Clock,
  Check,
  Loader2,
  CalendarDays,
  MapPin,
  ArrowRight,
  Lock,
  ChevronDown,
  X,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  itemType: "flight" | "hotel";
  itemDetails: {
    name: string;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    ratePerNight?: string;
    destination?: string;
    image?: string;
    // Flight specific details
    departureTime?: string;
    arrivalTime?: string;
    airline?: string;
  };
}

// Update the paymentMethods object with logos

const paymentMethods = [
  {
    id: "credit-card",
    name: "Credit / Debit Card",
    description: "Pay securely with your card",
    icon: <CreditCard className="h-5 w-5 text-blue-600" />,
    logos: [
      { src: "/images/payments/visa.png", alt: "Visa" },
      { src: "/images/payments/mastercard.png", alt: "Mastercard" },
      { src: "/images/payments/amex.png", alt: "American Express" },
    ],
  },
  {
    id: "qris",
    name: "QRIS",
    description: "Scan & pay with any e-wallet",
    icon: <QrCode className="h-5 w-5 text-green-600" />,
    logos: [],
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "Pay with your GoPay balance",
    icon: <Wallet className="h-5 w-5 text-green-500" />,
    logos: [{ src: "/images/payments/gopay.png", alt: "GoPay" }],
  },
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    description: "Transfer from any bank",
    icon: <Building className="h-5 w-5 text-gray-600" />,
    logos: [
      { src: "/images/payments/bca.png", alt: "BCA" },
      { src: "/images/payments/mandiri.png", alt: "Mandiri" },
      { src: "/images/payments/bni.png", alt: "BNI" },
    ],
  },
];

const svgLogos = {
  visa: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-blue-600"
    >
      <path d="M2 12h20" />
      <path d="M2 12l4-4" />
      <path d="M2 12l4 4" />
      <path d="M22 12l-4-4" />
      <path d="M22 12l-4 4" />
    </svg>
  ),
  mastercard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-red-600"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20" />
    </svg>
  ),
  amex: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-blue-600"
    >
      <path d="M2 12h20" />
      <path d="M2 12l4-4" />
      <path d="M2 12l4 4" />
      <path d="M22 12l-4-4" />
      <path d="M22 12l-4 4" />
      <path d="M12 2v20" />
    </svg>
  ),
  discover: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-orange-600"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20" />
      <path d="M2 12h20" />
    </svg>
  ),
};

// Update the PaymentLogo component to handle bank logos differently

const PaymentLogo = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);

  // Check if this is a bank logo
  const isBank = ["BCA", "Mandiri", "BNI"].includes(alt);

  // Return SVG logo if we have one matching the alt text, or if there was an error loading the image
  if (error || !src) {
    const altLower = alt.toLowerCase();
    if (altLower === "visa") return svgLogos.visa;
    if (altLower === "mastercard") return svgLogos.mastercard;
    if (altLower === "american express" || altLower === "amex")
      return svgLogos.amex;
    if (altLower === "discover") return svgLogos.discover;

    // Default fallback
    return <CreditCard className="h-5 w-5 text-gray-500" />;
  }

  return (
    <div className={`relative ${isBank ? "w-6 h-5" : "w-10 h-6"}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        onError={() => setError(true)}
        unoptimized
      />
    </div>
  );
};

// Update the QRCodeDisplay component to avoid problematic images
const QRCodeDisplay = ({
  amount,
  itemDetails,
}: {
  amount: number;
  itemDetails: any;
}) => {
  return (
    <div className="mt-4 p-6 bg-gray-50 rounded-xl flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <QRCodeSVG
          value={JSON.stringify({
            amount: (amount + amount * 0.1 + 2).toFixed(2),
            merchant: itemDetails.name,
            reference: `BOOKING-${Date.now()}`,
          })}
          size={180}
          level="H"
          includeMargin
        />
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Scan this QR code using your e-wallet app
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Amount: ${(amount + amount * 0.1 + 2).toFixed(2)}
      </p>
    </div>
  );
};

// Update the BankTransferDetails component to use local PNG images
const BankTransferDetails = ({ amount }: { amount: number }) => {
  const [selectedBank, setSelectedBank] = useState(0);
  const banks = ["BCA", "Mandiri", "BNI"];
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (bankName: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [bankName]: true,
    }));
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {banks.map((bank, index) => (
          <motion.button
            key={bank}
            onClick={() => setSelectedBank(index)}
            className={`p-3 rounded-lg border transition-all ${
              selectedBank === index
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="h-10 w-full mx-auto mb-2 flex items-center justify-center">
              {imageErrors[bank] ? (
                <Building className="h-6 w-6 text-gray-600" />
              ) : (
                <Image
                  src={`/images/payments/${bank.toLowerCase()}.png`}
                  alt={`${bank} logo`}
                  width={40}
                  height={40}
                  className="object-contain"
                  onError={() => handleImageError(bank)}
                  unoptimized // Add this to bypass image optimization
                />
              )}
            </div>
            {/* <p className="text-sm font-medium text-center">{bank}</p> */}
          </motion.button>
        ))}
      </div>

      <Card className="p-4 bg-gray-50">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Bank Name</span>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 mr-1">
                {!imageErrors[banks[selectedBank]] && (
                  <Image
                    src={`/images/payments/${banks[
                      selectedBank
                    ].toLowerCase()}.png`}
                    alt={`${banks[selectedBank]} logo`}
                    width={20}
                    height={20}
                    className="object-contain"
                    onError={() => handleImageError(banks[selectedBank])}
                    unoptimized
                  />
                )}
              </div>
              <span className="font-medium">{banks[selectedBank]}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Account Number</span>
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-sm font-mono">
                {`12345${selectedBank}${selectedBank}890`}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `12345${selectedBank}${selectedBank}890`
                  );
                  toast.success("Account number copied!");
                }}
              >
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
                  className="text-gray-500"
                >
                  <rect width="8" height="8" x="8" y="8" rx="1" />
                  <path d="M8 8v-1a1 1 0 0 1 1-1h1" />
                  <path d="M8 8h8" />
                </svg>
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Account Name</span>
            <span className="font-medium">PT TRAVEL COMPANY</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount to Transfer</span>
            <span className="font-bold text-primary">
              ${(amount + amount * 0.1 + 2).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const CreditCardForm = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, "");

    // Split into groups of 4
    const groups = cleanValue.match(/.{1,4}/g);

    // Join with spaces if we have groups, otherwise return original value
    return groups ? groups.join(" ") : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="mt-4 space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                maxLength={19} // 16 digits + 3 spaces
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="1234 5678 9012 3456"
              />
            </div>
          </div>

          {/* Card Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardName">Card Holder Name</Label>
            <input
              id="cardName"
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="JOHN DOE"
            />
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <input
                id="expiryDate"
                type="text"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(formatExpiryDate(e.target.value))
                }
                maxLength={5}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="MM/YY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <input
                id="cvv"
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                maxLength={4}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Lock className="h-4 w-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>
    </div>
  );
};

// Add new gradient background styles
const gradients = {
  blue: "bg-gradient-to-r from-blue-500 to-blue-600",
  green: "bg-gradient-to-r from-green-500 to-green-600",
  purple: "bg-gradient-to-r from-purple-500 to-purple-600",
};

// Add payment method specific styles
const methodStyles = {
  "credit-card": {
    gradient: gradients.blue,
    iconColor: "text-blue-500",
    hoverBg: "hover:bg-blue-50",
  },
  qris: {
    gradient: gradients.green,
    iconColor: "text-green-500",
    hoverBg: "hover:bg-green-50",
  },
  gopay: {
    gradient: gradients.green,
    iconColor: "text-green-500",
    hoverBg: "hover:bg-green-50",
  },
  "bank-transfer": {
    gradient: gradients.purple,
    iconColor: "text-purple-500",
    hoverBg: "hover:bg-purple-50",
  },
};

// Update the PaymentModal component
const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  itemType,
  itemDetails,
}: PaymentModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Payment successful!", {
        description: `Your ${itemType} has been booked.`,
        icon: <Check className="h-4 w-4 text-green-500" />,
      });

      onClose();
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 h-[90vh] sm:h-auto overflow-hidden rounded-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full"
        >
          {/* Mobile Header - Always visible */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="sticky top-0 z-30 bg-white border-b flex items-center justify-between p-4"
          >
            <DialogTitle className="text-lg font-semibold">Payment</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Content Container with Fixed Height and Scrolling */}
          <div className="flex flex-col md:flex-row h-[calc(90vh-116px)] sm:h-[650px]">
            {/* Summary Panel - Collapsible on mobile */}
            <div className="md:w-2/5 bg-gray-50 border-r md:overflow-y-auto">
              {/* Mobile Toggle Button */}
              <div className="md:hidden border-b bg-white">
                <button
                  onClick={() => setShowMobileSummary(!showMobileSummary)}
                  className="flex items-center justify-between w-full p-4 text-sm"
                >
                  <span className="font-medium">Booking Summary</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showMobileSummary ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Summary Content */}
              <div
                className={`${
                  !showMobileSummary && "hidden md:block"
                } p-4 space-y-4 overflow-y-auto max-h-[60vh] md:max-h-none`}
              >
                {/* Booking Summary Content */}
                <div className="space-y-4">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-semibold"
                  >
                    Booking Details
                  </motion.h2>

                  {/* Hotel/Airline Image with Animation */}
                  {itemDetails.image && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-full h-44 rounded-lg overflow-hidden shadow-md"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                      <motion.div
                        className="absolute inset-0 z-0"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 1.5 }}
                      >
                        <Image
                          src={itemDetails.image}
                          alt={itemDetails.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 40vw"
                          priority
                        />
                      </motion.div>

                      {/* Airline or Hotel Badge */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-sm rounded-md px-2.5 py-1.5 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          {itemType === "hotel" ? (
                            <>
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
                                className="text-primary"
                              >
                                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                                <path d="M2 21h20" />
                                <path d="M12 7v.01" />
                                <path d="M10 14h4" />
                                <path d="M9 10h6" />
                              </svg>
                              <span className="text-sm font-medium">Hotel</span>
                            </>
                          ) : (
                            <>
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
                                className="text-primary"
                              >
                                <path d="M17.8 19.2 16 11l3.5-3.5" />
                                <path d="m8 11 8 8" />
                                <path d="m8 13 5.5-5.5" />
                                <path d="M22 22H2" />
                                <path d="M19 9a7 7 0 1 0-13.6 2.3" />
                              </svg>
                              <span className="text-sm font-medium">
                                {itemDetails.airline || "Flight"}
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>

                      {/* Price Tag - Right Corner */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="absolute top-3 right-3 z-20 bg-primary text-white rounded-md px-2.5 py-1 shadow-sm"
                      >
                        <span className="text-sm font-medium">
                          ${amount.toFixed(2)}
                        </span>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Fallback when no image is provided */}
                  {!itemDetails.image && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-gray-200 to-gray-100 h-32 rounded-lg flex items-center justify-center"
                    >
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mx-auto mb-2 rounded-full bg-white/80 p-3 w-14 h-14 flex items-center justify-center"
                        >
                          {itemType === "hotel" ? (
                            <Building className="h-8 w-8 text-gray-500" />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-500"
                            >
                              <path d="M17.8 19.2 16 11l3.5-3.5" />
                              <path d="m8 11 8 8" />
                              <path d="m8 13 5.5-5.5" />
                              <path d="M22 22H2" />
                              <path d="M19 9a7 7 0 1 0-13.6 2.3" />
                            </svg>
                          )}
                        </motion.div>
                        <p className="text-sm text-gray-600 font-medium">
                          {itemDetails.name}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Continue with the rest of the item details */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-medium text-gray-900">
                      {itemDetails.name}
                    </h3>

                    {itemDetails.destination && (
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{itemDetails.destination}</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Date/Time Information with Animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card className="bg-white shadow-sm overflow-hidden">
                      <motion.div
                        className="p-3 space-y-3"
                        initial={{ backgroundPosition: "0% 0%" }}
                        whileHover={{
                          backgroundPosition: "100% 100%",
                          transition: { duration: 1.5 },
                        }}
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, #ffffff, #f9fafb, #ffffff)",
                          backgroundSize: "200% 200%",
                        }}
                      >
                        {itemType === "hotel" ? (
                          <div className="space-y-2">
                            <motion.div
                              className="flex items-start gap-2"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              <CalendarDays className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Check-in</p>
                                <p className="text-sm text-gray-600">
                                  {itemDetails.checkIn}
                                </p>
                              </div>
                            </motion.div>
                            <motion.div
                              className="flex items-start gap-2"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.6 }}
                            >
                              <CalendarDays className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Check-out</p>
                                <p className="text-sm text-gray-600">
                                  {itemDetails.checkOut}
                                </p>
                              </div>
                            </motion.div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <motion.div
                              className="flex items-start gap-2"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Departure</p>
                                <p className="text-sm text-gray-600">
                                  {itemDetails.departureTime}
                                </p>
                              </div>
                            </motion.div>
                            <motion.div
                              className="flex items-start gap-2"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.6 }}
                            >
                              <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">Arrival</p>
                                <p className="text-sm text-gray-600">
                                  {itemDetails.arrivalTime}
                                </p>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </motion.div>
                    </Card>
                  </motion.div>

                  {/* Price Summary with Animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card className="bg-white shadow-sm overflow-hidden">
                      <div className="p-3 space-y-2">
                        <motion.div
                          className="flex justify-between text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <span className="text-gray-600">Subtotal</span>
                          <span>${amount.toFixed(2)}</span>
                        </motion.div>
                        <motion.div
                          className="flex justify-between text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <span className="text-gray-600">Tax (10%)</span>
                          <span>${(amount * 0.1).toFixed(2)}</span>
                        </motion.div>
                        <motion.div
                          className="flex justify-between text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <span className="text-gray-600">Service Fee</span>
                          <span>$2.00</span>
                        </motion.div>
                        <motion.div
                          className="pt-2 mt-2 border-t flex justify-between"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.9,
                            type: "spring",
                            stiffness: 120,
                          }}
                        >
                          <span className="font-medium">Total</span>
                          <motion.span
                            className="font-bold text-primary"
                            whileHover={{ scale: 1.05 }}
                          >
                            ${(amount + amount * 0.1 + 2).toFixed(2)}
                          </motion.span>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Payment Section - Scrollable */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4">
                {/* Payment Methods with Staggered Animation */}
                <div className="space-y-5 pb-24">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-medium"
                  >
                    Select Payment Method
                  </motion.h2>

                  {/* Payment Methods with Staggered Animation */}
                  <div className="space-y-3">
                    {paymentMethods.map((method, index) => (
                      <motion.button
                        key={method.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.1 + 0.2,
                          type: "spring",
                          stiffness: 100,
                        }}
                        onClick={() => setSelectedMethod(method.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          selectedMethod === method.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="p-2 rounded-lg bg-gray-100"
                            whileHover={{ backgroundColor: "#f9fafb" }}
                            animate={{
                              scale: selectedMethod === method.id ? 1.05 : 1,
                            }}
                          >
                            {method.icon}
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{method.name}</span>
                              {method.logos.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {method.logos.map((logo, i) => (
                                    <div
                                      key={i}
                                      className="relative h-6 w-6 flex items-center justify-center"
                                    >
                                      <PaymentLogo
                                        src={logo.src}
                                        alt={logo.alt}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Payment Forms with Enhanced Animation */}
                  <AnimatePresence mode="wait">
                    {selectedMethod && (
                      <motion.div
                        key={selectedMethod}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {selectedMethod === "credit-card" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <CreditCardForm />
                          </motion.div>
                        )}
                        {selectedMethod === "bank-transfer" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <BankTransferDetails amount={amount} />
                          </motion.div>
                        )}
                        {selectedMethod === "qris" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <QRCodeDisplay
                              amount={amount}
                              itemDetails={itemDetails}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer - Always visible */}
          <motion.div
            className="sticky bottom-0 left-0 right-0 border-t bg-white p-4 z-20"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className={`w-full ${
                  !selectedMethod || isProcessing
                    ? "bg-gray-300"
                    : "bg-primary hover:bg-primary/90"
                }`}
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
              >
                {isProcessing ? (
                  <motion.div
                    className="flex items-center justify-center"
                    animate={{
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                    }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Processing...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key="pay-button"
                    transition={{ duration: 0.2 }}
                  >
                    Pay ${(amount + amount * 0.1 + 2).toFixed(2)}
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
