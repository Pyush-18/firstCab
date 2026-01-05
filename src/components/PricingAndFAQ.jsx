// User-side PricingAndFAQ.jsx - Updated to fetch from Firebase
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Users,
  Luggage,
  ChevronDown,
  ChevronUp,
  MapPin,
  Info,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import {
  initiatePayment,
  processRazorpayPayment,
  resetPaymentState,
} from "../store/slices/paymentSlice";
import { fetchActiveRoutes } from "../store/slices/routeSlice";
import { fetchAllPricing } from "../store/slices/pricingSlice";

const PricingAndFAQ = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { routes, loading: routesLoading } = useSelector(
    (state) => state.routes
  );
  const { pricing, loading: pricingLoading } = useSelector(
    (state) => state.pricing
  );
  const { currentPayment, loading, error, paymentSuccess, processingPayment } =
    useSelector((state) => state.payment);

  const [pricingMode, setPricingMode] = useState("one-way");
  const [openFAQ, setOpenFAQ] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getCarImage = (carType, routeFrom, routeTo, routes) => {
    const matchingRoute = routes.find(
      (r) => r.from === routeFrom && r.to === routeTo && r.imageUrl
    );

    if (matchingRoute?.imageUrl) {
      return matchingRoute.imageUrl;
    }

    const defaultImages = {
      Sedan:
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80",
      SUV: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&q=80",
      Sports:
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&q=80",
      Hatchback:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&q=80",
      "Comfort Sedan":
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80",
      "Family SUV":
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&q=80",
      "Premium SUV":
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&q=80",
    };

    return (
      defaultImages[carType] ||
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80"
    );
  };

  // Fetch routes and pricing on mount
  useEffect(() => {
    dispatch(fetchActiveRoutes());
    dispatch(fetchAllPricing());
  }, [dispatch]);

  useEffect(() => {
    if (paymentSuccess) {
      setShowPaymentModal(false);
      setSelectedBooking(null);
      setTimeout(() => {
        dispatch(resetPaymentState());
        navigate("/bookings");
      }, 2000);
    }
  }, [paymentSuccess, dispatch, navigate]);

  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  // Group pricing by route and trip type
  const oneWayPricing = pricing.filter((p) => p.tripType === "one-way");
  const roundTripPricing = pricing.filter((p) => p.tripType === "round-trip");

  // Group one-way pricing by route
  const groupedOneWayPricing = {};
  oneWayPricing.forEach((price) => {
    const key = `${price.routeFrom}-${price.routeTo}`;
    if (!groupedOneWayPricing[key]) {
      groupedOneWayPricing[key] = {
        from: price.routeFrom,
        to: price.routeTo,
        cars: [],
      };
    }
    groupedOneWayPricing[key].cars.push(price);
  });

  // Convert to array and transform for display
  // Convert to array and transform for display
  const pricingData = {
    oneWay: Object.values(groupedOneWayPricing).flatMap((routeGroup) => {
      // Get unique car types for this route
      const carTypeMap = {};
      routeGroup.cars.forEach((car) => {
        console.log(car);
        if (!carTypeMap[car.carType]) {
          carTypeMap[car.carType] = {
            name: car.carType,
            model: car.carModel || "",
            capacity: car.capacity?.toString() || "4",
            luggage: car.luggage || "2 Large",
            // ✅ Get image from routes or use fallback
            image: getCarImage(
              car.carType,
              routeGroup.from,
              routeGroup.to,
              routes
            ),
            routes: [],
            features: car.features || ["AC Included", "No Hidden Charges"],
            warnings: ["Parking charges extra if applicable"],
          };
        }
        carTypeMap[car.carType].routes.push({
          from: routeGroup.from,
          to: routeGroup.to,
          price: `₹${car.price}`,
          pricingId: car.id,
        });
      });
      return Object.values(carTypeMap);
    }),

    roundTrip: roundTripPricing.map((price) => {
      // ✅ For round trip, find the first route with an image
      const matchingRoute = routes.find((r) => r.imageUrl);

      return {
        name: price.carType,
        model: price.carModel || "",
        capacity: price.capacity?.toString() || "4",
        luggage: price.luggage || "2 Large",
        pricePerKm: `₹${price.pricePerKm || 11}`,
        minKm: price.minKm || "250km / day",
        // ✅ Try pricing imageUrl, then route imageUrl, then fallback
        image:
          price.imageUrl ||
          matchingRoute?.imageUrl ||
          getCarImage(price.carType, "", "", routes),
        features: price.features || [
          "Night Halt ₹500 (after 12 AM)",
          "Day Halt ₹1200 (after 8 AM)",
          "Toll & Parking Extra",
        ],
        pricingId: price.id,
      };
    }),
  };

  const faqs = [
    {
      q: "How do I book a cab from Kharagpur to Kolkata Airport?",
      a: "Booking is simple! Select 'One-Way', choose your pickup point (Kharagpur, IIT, etc.), select the date, and click 'Book Now'. You can also call our 24/7 support line.",
    },
    {
      q: "Are there any hidden charges in the fixed fare?",
      a: "No. Our one-way fares are all-inclusive of driver allowance and fuel. The only extras are parking or toll charges if specifically applicable to your route.",
    },
    {
      q: "What is the difference between One-Way and Round-Trip?",
      a: "One-Way is a point-to-point drop (e.g., IIT to Airport). Round-Trip implies you will return to the origin city with the same car. Round trips are charged per kilometer.",
    },
    {
      q: "Is the service available late at night?",
      a: "Yes, we operate 24/7. However, for pickups between 11 PM and 5 AM, we recommend booking at least 4 hours in advance.",
    },
  ];

  const handleBooking = async (car, route = null) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    let bookingDetails = {
      carName: car.name,
      carModel: car.model,
      capacity: car.capacity,
      luggage: car.luggage,
      tripType: pricingMode === "one-way" ? "oneWay" : "roundTrip",
      bookingDate: new Date().toISOString(),
    };

    let amount;

    if (pricingMode === "one-way" && route) {
      bookingDetails = {
        ...bookingDetails,
        from: route.from,
        to: route.to,
        route: `${route.from} → ${route.to}`,
        pricingId: route.pricingId,
      };
      amount = route.price;
    } else {
      // ✅ For round trip, get the pricing details to find route info
      const pricingDetails = pricing.find((p) => p.id === car.pricingId);

      bookingDetails = {
        ...bookingDetails,
        from: pricingDetails?.routeFrom || "N/A", 
        to: pricingDetails?.routeTo || "N/A", 
        route: pricingDetails
          ? `${pricingDetails.routeFrom} → ${pricingDetails.routeTo}`
          : "Round Trip", 
        pricePerKm: car.pricePerKm,
        minKm: car.minKm,
        pricingId: car.pricingId,
      };
      const kmValue = parseInt(car.minKm);
      const pricePerKmValue = parseInt(car.pricePerKm.replace("₹", ""));
      amount = `₹${kmValue * pricePerKmValue}`;
    }

    setSelectedBooking({
      ...bookingDetails,
      amount,
    });
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedBooking) return;

    try {
      const result = await dispatch(
        initiatePayment({
          bookingData: selectedBooking,
          amount: selectedBooking.amount,
          tripType: pricingMode,
        })
      ).unwrap();

      await dispatch(
        processRazorpayPayment({
          paymentData: result,
          onSuccess: () => {
            console.log("Payment successful!");
          },
        })
      ).unwrap();
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  if (routesLoading || pricingLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <AnimatePresence>
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 max-w-[90vw] sm:max-w-none"
          >
            <CheckCircle size={20} className="sm:w-6 sm:h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm sm:text-base">
                Payment Successful!
              </p>
              <p className="text-xs sm:text-sm">
                Redirecting to your bookings...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => !processingPayment && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
                Confirm Booking
              </h3>

              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-slate-500 mb-1">
                    Vehicle
                  </p>
                  <p className="font-bold text-base sm:text-lg text-slate-900">
                    {selectedBooking.carName}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {selectedBooking.carModel}
                  </p>
                </div>

                {selectedBooking.route && (
                  <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">
                      Route
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900">
                      {selectedBooking.route}
                    </p>
                  </div>
                )}

                {selectedBooking.pricePerKm && (
                  <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">
                      Pricing
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900">
                      {selectedBooking.pricePerKm}/km • Min{" "}
                      {selectedBooking.minKm}
                    </p>
                  </div>
                )}

                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-amber-700 mb-1">
                    Total Amount
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                    {selectedBooking.amount}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <AlertCircle
                      className="text-red-500 shrink-0 mt-0.5"
                      size={18}
                    />
                    <p className="text-xs sm:text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() =>
                    !processingPayment && setShowPaymentModal(false)
                  }
                  disabled={processingPayment}
                  className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm sm:text-base hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={loading || processingPayment}
                  className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-linear-to-r from-amber-500 to-orange-600 text-white font-bold text-sm sm:text-base hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading || processingPayment ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      <span className="text-sm sm:text-base">
                        Processing...
                      </span>
                    </>
                  ) : (
                    <>
                      Pay Now
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 md:w-125 md:h-125 bg-amber-200/20 rounded-full blur-[80px] sm:blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 md:w-125 md:h-125 bg-orange-200/20 rounded-full blur-[80px] sm:blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight px-4">
              Transparent <span className="text-amber-600">Pricing</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4">
              No hidden fees. Whether you need a quick drop to the airport or a
              luxury weekend getaway, we have a plan for you.
            </p>

            <div className="inline-flex bg-white p-1 sm:p-1.5 rounded-full shadow-lg border border-slate-100 relative mx-4">
              <div
                className={`absolute top-1 sm:top-1.5 bottom-1 sm:bottom-1.5 rounded-full bg-linear-to-r from-amber-500 to-orange-600 transition-all duration-300 ease-out shadow-md`}
                style={{
                  left: pricingMode === "one-way" ? "4px" : "50%",
                  width: "calc(50% - 4px)",
                }}
              />
              <button
                onClick={() => setPricingMode("one-way")}
                className={`relative z-10 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 whitespace-nowrap ${
                  pricingMode === "one-way"
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                One-Way Drop
              </button>
              <button
                onClick={() => setPricingMode("round-trip")}
                className={`relative z-10 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 whitespace-nowrap ${
                  pricingMode === "round-trip"
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Round Trip
              </button>
            </div>
          </motion.div>

          {pricingData[pricingMode === "one-way" ? "oneWay" : "roundTrip"]
            .length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">
                No pricing available for this trip type
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            >
              {pricingData[
                pricingMode === "one-way" ? "oneWay" : "roundTrip"
              ].map((car, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className={`bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl border border-slate-100 flex flex-col relative group ${
                    car.isPopular ? "ring-2 ring-amber-500 ring-offset-2" : ""
                  }`}
                >
                  {car.isPopular && (
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                      BEST VALUE
                    </div>
                  )}

                  <div className="h-40 sm:h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent z-10" />
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-20 text-white">
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {car.name}
                      </h3>
                      <p className="text-slate-200 text-xs sm:text-sm font-medium">
                        {car.model}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6 pb-4 sm:pb-5 md:pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 bg-slate-50 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium">
                        <Users
                          size={14}
                          className="text-amber-500 sm:w-4 sm:h-4"
                        />{" "}
                        {car.capacity}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 bg-slate-50 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium">
                        <Luggage
                          size={14}
                          className="text-amber-500 sm:w-4 sm:h-4"
                        />{" "}
                        {car.luggage}
                      </div>
                    </div>

                    <div className="mb-4 sm:mb-5 md:mb-6 space-y-2 sm:space-y-3 flex-1">
                      {pricingMode === "one-way" ? (
                        car.routes.map((route, rIdx) => (
                          <div
                            key={`${idx}-route-${rIdx}`}
                            className="bg-slate-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-100 hover:border-amber-200 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Route
                              </span>
                              <span className="text-base sm:text-lg font-bold text-amber-600">
                                {route.price}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700 font-medium mb-2 sm:mb-3">
                              <MapPin
                                size={12}
                                className="text-slate-400 sm:w-3.5 sm:h-3.5 shrink-0"
                              />
                              <span className="truncate">{route.from}</span>
                              <ArrowRight
                                size={10}
                                className="text-slate-300 sm:w-3 sm:h-3 shrink-0"
                              />
                              <span className="truncate">{route.to}</span>
                            </div>
                            <button
                              onClick={() => handleBooking(car, route)}
                              className="w-full py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-slate-900 text-white font-semibold hover:bg-linear-to-r hover:from-amber-500 hover:to-orange-600 transition-all"
                            >
                              Book This Route
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3 sm:py-4 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-100">
                          <p className="text-slate-500 text-[10px] sm:text-xs mb-1 uppercase tracking-wider font-semibold">
                            Price per KM
                          </p>
                          <p className="text-3xl sm:text-4xl font-extrabold text-amber-600 mb-1 sm:mb-2">
                            {car.pricePerKm}
                          </p>
                          <p className="text-[10px] sm:text-xs text-amber-700/70 font-medium">
                            Min. billing {car.minKm}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 md:mb-6">
                      {car.features.map((feat, fIdx) => (
                        <div
                          key={`${idx}-feat-${fIdx}`}
                          className="flex items-start gap-2 sm:gap-2.5"
                        >
                          {pricingMode === "round-trip" &&
                          feat.includes("Halt") ? (
                            <Info
                              size={14}
                              className="text-amber-500 mt-0.5 shrink-0 sm:w-4 sm:h-4"
                            />
                          ) : (
                            <Check
                              size={14}
                              className="text-green-500 mt-0.5 shrink-0 sm:w-4 sm:h-4"
                            />
                          )}
                          <span className="text-xs sm:text-sm text-slate-600 leading-tight">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>

                    {pricingMode === "round-trip" && (
                      <button
                        onClick={() => handleBooking(car)}
                        className="w-full py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl bg-slate-900 text-white text-sm sm:text-base font-bold hover:bg-linear-to-r hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 active:scale-95"
                      >
                        Book {car.name}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <div className="h-1 w-16 sm:w-20 bg-amber-500 mx-auto rounded-full"></div>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ${
                  openFAQ === index
                    ? "border-amber-200 bg-amber-50/30 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                  className="w-full px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 md:py-5 flex items-center justify-between text-left focus:outline-none gap-3"
                >
                  <span
                    className={`font-semibold text-sm sm:text-base md:text-lg transition-colors leading-snug ${
                      openFAQ === index ? "text-amber-700" : "text-slate-800"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
                      openFAQ === index
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {openFAQ === index ? (
                      <ChevronUp size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <ChevronDown size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-4 sm:px-5 md:px-6 pb-3.5 sm:pb-4 md:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-10 md:mt-12 text-center bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                Still have questions?
              </h3>
              <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8">
                Can't find the answer you're looking for? Please chat to our
                friendly team.
              </p>
              <button
                onClick={() => navigate("/contact")}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-amber-500 text-white text-sm sm:text-base rounded-full font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/25"
              >
                Contact Support
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingAndFAQ;
