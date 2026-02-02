"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

interface DeliveryPrice {
  id: string;
  governorate: string;
  price: number;
}

// Lebanon governorates and districts
const lebanonData = {
  "Beirut": ["Beirut"],
  "Mount Lebanon": ["Aley", "Baabda", "Chouf", "Matn", "Keserwan", "Byblos"],
  "Akkar": ["Akkar"],
  "North Lebanon": ["Batroun", "Bcharre", "Koura", "Miniyeh-Danniyeh", "Tripoli", "Zgharta"],
  "South Lebanon": ["Jezzine", "Nabatieh", "Sidon", "Tyre"],
  "Bekaa": ["Rashaya", "Western Bekaa", "Zahle"],
  "Baalbek-Hermel": ["Baalbek", "Hermel"],
  "Nabatieh": ["Bint Jbeil", "Hasbaya", "Marjayoun", "Nabatieh"]
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, removeFromCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPrice[]>([]);
  const [loadingDelivery, setLoadingDelivery] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    country: "Lebanon",
    governorate: "",
    district: "",
    city: "",
    streetName: "",
    buildingName: "",
  });

  // Fetch delivery prices from database
  useEffect(() => {
    const fetchDeliveryPrices = async () => {
      try {
        setLoadingDelivery(true);
        const response = await fetch('/api/delivery');
        if (response.ok) {
          const data = await response.json();
          setDeliveryPrices(data);
        } else {
          console.error('Failed to fetch delivery prices');
        }
      } catch (error) {
        console.error('Error fetching delivery prices:', error);
      } finally {
        setLoadingDelivery(false);
      }
    };

    fetchDeliveryPrices();
  }, []);

  // Calculate shipping cost based on selected governorate
  const getShippingCost = (): number => {
    if (!formData.governorate) {
      return 0;
    }

    const delivery = deliveryPrices.find(
      (d) => d.governorate === formData.governorate
    );

    return delivery ? delivery.price : 0;
  };

  const shippingCost = getShippingCost();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalPrice = subtotal + shippingCost;

  const availableDistricts = formData.governorate
    ? lebanonData[formData.governorate as keyof typeof lebanonData] || []
    : [];

  const validatePhoneNumber = (phone: string): boolean => {
    // Simple regex validation: +961 followed by 1-2 digits, then 3 digits, then 3 digits
    // Allows optional spaces
    const phoneRegex = /^\+961\s?\d{1,2}\s?\d{3}\s?\d{3}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove dashes, parentheses, and letters
    value = value.replace(/[-()a-zA-Z]/g, "");

    // Auto-prepend +961 if missing
    if (!value.startsWith("+961") && value.length > 0) {
      // Remove any existing +961 or partial +961
      value = value.replace(/^\+?9?6?1?/, "");
      value = "+961" + value;
    }

    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));

    // Clear error while typing (validation only on blur/submit)
    if (errors.phoneNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.phoneNumber;
        return newErrors;
      });
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;

    // Prevent deleting +961 prefix
    if ((e.key === "Backspace" || e.key === "Delete") && cursorPosition <= 4) {
      e.preventDefault();
    }

    // Allow digits, spaces, and + (but + is handled by formatter)
    if (e.key.length === 1 && !/[0-9+\s]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Validate phone number on blur
    if (value.trim()) {
      if (!validatePhoneNumber(value)) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "Please enter a valid Lebanese phone number (+961 …)",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.phoneNumber;
          return newErrors;
        });
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle phone number separately with auto-formatting
    if (name === "phoneNumber") {
      return; // Phone number is handled by handlePhoneInputChange
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset district when governorate changes
      if (name === "governorate") {
        newData.district = "";
      }
      return newData;
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid Lebanese phone number (+961 …)";
    }
    if (!formData.governorate) {
      newErrors.governorate = "Governorate is required";
    }
    if (!formData.district) {
      newErrors.district = "District is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City/Town is required";
    }
    if (!formData.streetName.trim()) {
      newErrors.streetName = "Street name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatWhatsAppMessage = () => {
    const itemsText = cartItems
      .map(
        (item) =>
          `• ${item.name}${item.variant ? ` (${item.variant})` : ""}\n  Quantity: ${item.quantity}\n  Price: $${item.price.toLocaleString()}`
      )
      .join("\n\n");

    return `*New Order - LC ORGANIC*

*Customer Information:*
Name: ${formData.fullName}
Phone: ${formData.phoneNumber}

*Delivery Address:*
Country/Region: ${formData.country}
Governorate: ${formData.governorate}
District: ${formData.district}
City/Town: ${formData.city}
Street: ${formData.streetName}${formData.buildingName ? `\nBuilding: ${formData.buildingName}` : ""}

*Order Details:*
${itemsText}

*Order Summary:*
Subtotal: $${subtotal.toLocaleString()}
Shipping: $${shippingCost.toFixed(2)}
Total: $${totalPrice.toLocaleString()}

Payment Method: Cash on Delivery`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      router.push("/cart");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Send to WhatsApp (existing flow)
      const message = formatWhatsAppMessage();
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/96170717397?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, "_blank");

      // Step 2: Save order to database
      try {
        const orderData = {
          customerName: formData.fullName,
          customerPhone: formData.phoneNumber,
          country: formData.country,
          governorate: formData.governorate,
          district: formData.district,
          city: formData.city,
          streetName: formData.streetName,
          buildingName: formData.buildingName,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            variant: item.variant,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal: subtotal,
          shipping: shippingCost,
          total: totalPrice,
          paymentMethod: "Cash on Delivery"
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to save order:', errorData);
          // Don't block user flow - WhatsApp was sent successfully
          // Order can be saved manually later if needed
        } else {
          const result = await response.json();
          console.log('Order saved successfully:', result.orderNumber);
        }
      } catch (orderError) {
        console.error('Error saving order to database:', orderError);
        // Don't block user flow - WhatsApp was sent successfully
        // Order can be saved manually later if needed
      }

      // Step 3: Show success message
      setIsSuccess(true);

      // Step 4: Clear cart after a short delay
      setTimeout(() => {
        cartItems.forEach((item) => removeFromCart(item.id));
      }, 2000);
    } catch (error) {
      console.error("Error sending order:", error);
      alert("There was an error sending your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <Navbar />
        <main className="flex-1 pt-24 md:pt-28 lg:pt-32">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-20">
              <p className="mb-6 text-lg text-neutral-600">
                Your cart is empty
              </p>
              <button
                onClick={() => router.push("/cart")}
                className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Go to Cart
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 lg:pt-32">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="mb-12 text-center font-serif text-3xl font-normal tracking-wide text-[#5B3A82] md:text-4xl" style={{ fontFamily: 'var(--font-lora), serif' }}>
            Checkout
          </h1>

          {isSuccess ? (
            <div className="mx-auto max-w-2xl px-4">
              <div className="rounded-3xl border border-purple-100 bg-white p-12 text-center shadow-xl">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-purple-50 text-[#5B3A82]">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mb-4 text-2xl font-medium text-[#5B3A82]">
                  Order Sent Successfully!
                </h2>
                <p className="mb-8 text-neutral-500 font-light leading-relaxed">
                  Your order has been received. We will contact you soon on WhatsApp to confirm the details.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="w-full rounded-full bg-[#483063] px-8 py-4 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#5B3A82]"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-7xl">
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-[60%_40%]">
                {/* Left Column: Customer Information */}
                <div className="space-y-8 bg-white border border-neutral-100 -mx-4 px-4 py-8 sm:px-6 lg:mx-0 lg:px-8 lg:py-10 rounded-3xl shadow-sm">
                  {/* Customer Information Section */}
                  <div>
                    <h2 className="mb-8 text-xl font-medium text-[#5B3A82] flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-xs">1</span>
                      Customer Information
                    </h2>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Full Name */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="fullName"
                          className="mb-2 block text-sm font-medium text-slate-500"
                        >
                          Full Name <span className="text-red-400 font-light">*</span>
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full rounded-xl border bg-white px-5 py-3.5 text-neutral-900 placeholder:text-neutral-300 transition-all focus:border-[#5B3A82] focus:outline-none focus:ring-1 focus:ring-[#5B3A82] ${errors.fullName ? "border-red-300" : "border-neutral-200"
                            }`}
                          placeholder="Your legal name"
                        />
                        {errors.fullName && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="phoneNumber"
                          className="mb-2 block text-sm font-medium text-slate-500"
                        >
                          Phone Number <span className="text-red-400 font-light">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handlePhoneInputChange}
                          onBlur={handlePhoneBlur}
                          onKeyDown={handlePhoneKeyDown}
                          className={`w-full rounded-xl border bg-white px-5 py-3.5 text-neutral-900 placeholder:text-neutral-300 transition-all focus:border-[#5B3A82] focus:outline-none focus:ring-1 focus:ring-[#5B3A82] ${errors.phoneNumber
                            ? "border-red-300"
                            : "border-neutral-200"
                            }`}
                          placeholder="+961 70 123 456"
                        />
                        {errors.phoneNumber && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Section */}
                  <div className="pt-4">
                    <h3 className="mb-8 text-xl font-medium text-[#5B3A82] flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-xs">2</span>
                      Delivery Address
                    </h3>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Country/Region */}
                      <div>
                        <label
                          htmlFor="country"
                          className="mb-2 block text-sm font-medium text-slate-500"
                        >
                          Country/Region
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-3.5 text-neutral-900 cursor-not-allowed opacity-70"
                          disabled
                        >
                          <option value="Lebanon">Lebanon</option>
                        </select>
                      </div>

                      {/* Governorate */}
                      <div>
                        <label
                          htmlFor="governorate"
                          className="mb-2 block text-sm font-medium text-slate-500"
                        >
                          Governorate <span className="text-red-400 font-light">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="governorate"
                            name="governorate"
                            value={formData.governorate}
                            onChange={handleInputChange}
                            className={`w-full rounded-xl border bg-white px-5 py-3.5 text-neutral-900 appearance-none focus:border-[#5B3A82] focus:outline-none focus:ring-1 focus:ring-[#5B3A82] ${errors.governorate
                              ? "border-red-300"
                              : "border-neutral-200"
                              }`}
                          >
                            <option value="">Select</option>
                            {Object.keys(lebanonData).map((gov) => (
                              <option key={gov} value={gov}>
                                {gov}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                        </div>
                        {errors.governorate && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.governorate}
                          </p>
                        )}
                      </div>

                      {/* District */}
                      <div>
                        <label
                          htmlFor="district"
                          className="mb-2 block text-sm font-medium text-slate-500"
                        >
                          District <span className="text-red-400 font-light">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            disabled={!formData.governorate}
                            className={`w-full rounded-xl border bg-white px-5 py-3.5 text-neutral-900 appearance-none disabled:bg-neutral-50 disabled:cursor-not-allowed focus:border-[#5B3A82] focus:outline-none focus:ring-1 focus:ring-[#5B3A82] ${errors.district
                              ? "border-red-300"
                              : "border-neutral-200"
                              }`}
                          >
                            <option value="">
                              {formData.governorate
                                ? "Select"
                                : "Select governorate first"}
                            </option>
                            {availableDistricts.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                        </div>
                        {errors.district && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.district}
                          </p>
                        )}
                      </div>

                      {/* City/Town */}
                      <div>
                        <label
                          htmlFor="city"
                          className="mb-2 block text-sm font-medium text-slate-500"
                        >
                          City / Town <span className="text-red-400 font-light">*</span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full rounded-xl border bg-white px-5 py-3.5 text-neutral-900 placeholder:text-neutral-300 focus:border-[#5B3A82] focus:outline-none focus:ring-1 focus:ring-[#5B3A82] ${errors.city ? "border-red-300" : "border-neutral-200"
                            }`}
                          placeholder="e.g. Beirut"
                        />
                        {errors.city && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Details Section */}
                  <div className="pt-4">
                    <h3 className="mb-8 text-xl font-medium text-[#5B3A82] flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-xs">3</span>
                      Address Details
                    </h3>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Street Name */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="streetName"
                          className="mb-2 block text-sm font-medium text-slate-500"
                        >
                          Street Name <span className="text-red-400 font-light">*</span>
                        </label>
                        <input
                          type="text"
                          id="streetName"
                          name="streetName"
                          value={formData.streetName}
                          onChange={handleInputChange}
                          className={`w-full rounded-xl border bg-white px-5 py-3.5 text-neutral-900 placeholder:text-neutral-300 focus:border-[#5B3A82] focus:outline-none focus:ring-1 focus:ring-[#5B3A82] ${errors.streetName
                            ? "border-red-300"
                            : "border-neutral-200"
                            }`}
                          placeholder="Street name, landmark"
                        />
                        {errors.streetName && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.streetName}
                          </p>
                        )}
                      </div>

                      {/* Building Name */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="buildingName"
                          className="mb-2 block text-sm font-medium text-slate-500"
                        >
                          Building Name / Floor
                        </label>
                        <input
                          type="text"
                          id="buildingName"
                          name="buildingName"
                          value={formData.buildingName}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3.5 text-neutral-900 placeholder:text-neutral-300 focus:border-[#5B3A82] focus:outline-none focus:ring-1 focus:ring-[#5B3A82]"
                          placeholder="Building, floor, apartment"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method Section */}
                  <div className="pt-4">
                    <h3 className="mb-6 text-xl font-medium text-[#5B3A82] flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-xs">4</span>
                      Shipping Method
                    </h3>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[#5B3A82]">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-6 0a1 1 0 001-1m9 1a1 1 0 01-1 1h-1m-6 0a1 1 0 01-1-1" />
                          </svg>
                          <span className="font-medium">Deliver All Over Lebanon</span>
                        </div>
                        <span className="font-semibold text-[#5B3A82]">
                          ${shippingCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary & Payment - Desktop */}
                <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-3xl border border-neutral-100 bg-white shadow-xl p-8">
                    <h2 className="mb-8 text-xl font-medium text-[#5B3A82]">
                      Order Summary
                    </h2>

                    <div className="mb-8 space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                      {cartItems.map((item, index) => (
                        <div key={item.id} className="group">
                          <div className="flex gap-5">
                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-50 shadow-sm transition-transform group-hover:scale-105">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h3 className="mb-1 text-sm font-medium text-slate-600 truncate">
                                {item.name}
                              </h3>
                              {item.variant && (
                                <p className="mb-1 text-xs text-neutral-400 font-light">
                                  {item.variant}
                                </p>
                              )}
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-neutral-500">
                                  Qty: <span className="text-[#5B3A82] font-medium">{item.quantity}</span>
                                </p>
                                <p className="text-sm font-medium text-[#5B3A82]">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                          {index < cartItems.length - 1 && (
                            <div className="mt-6 border-t border-neutral-50"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Payment Method */}
                    <div className="mb-8 border-t border-neutral-100 pt-8">
                      <h3 className="mb-4 text-sm font-medium text-[#5B3A82] uppercase tracking-wider">
                        Payment Method
                      </h3>
                      <div className="rounded-2xl border border-purple-100 bg-purple-50/20 p-4 border-dashed">
                        <p className="text-sm font-normal text-[#5B3A82] flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          Cash on Delivery
                        </p>
                      </div>
                    </div>

                    {/* Order Summary Totals */}
                    <div className="mb-8 border-t border-neutral-100 pt-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-neutral-500">
                          Subtotal
                        </span>
                        <span className="text-sm font-medium text-slate-600">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-neutral-500">
                          Shipping
                        </span>
                        <span className="text-sm font-medium text-slate-600">
                          ${shippingCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                        <span className="text-lg font-medium text-[#5B3A82]">
                          Total
                        </span>
                        <span className="text-2xl font-semibold text-[#5B3A82]">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Confirm Order Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isSuccess}
                      className="w-full rounded-full bg-[#483063] px-8 py-5 text-sm font-medium text-white shadow-xl transition-all hover:bg-[#5B3A82] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Sending..." : (
                        <>
                          <Lock className="w-4 h-4" />
                          Complete Payment
                        </>
                      )}
                    </button>

                    <p className="mt-4 text-center text-[10px] text-neutral-400 font-light">
                      By clicking complete, you agree to our terms of service.
                    </p>
                  </div>
                </div>

                {/* Mobile: Order Summary */}
                <div className="lg:hidden">
                  <div className="rounded-3xl border border-neutral-100 bg-white shadow-lg overflow-hidden">
                    {/* Mobile: Collapsible Header */}
                    <button
                      type="button"
                      onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                      className="w-full flex items-center justify-between py-6 px-6 bg-purple-50/30 transition-colors duration-200 hover:bg-purple-50"
                    >
                      <div className="flex items-center gap-3">
                        <h2 className="text-base font-medium text-[#5B3A82] uppercase tracking-wider">
                          Order Summary
                        </h2>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-[#5B3A82] transition-transform duration-300 ${isOrderSummaryOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {/* Mobile: Collapsible Products */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOrderSummaryOpen
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                        }`}
                    >
                      <div className="py-6 space-y-6 border-b border-neutral-100 px-6">
                        {cartItems.map((item, index) => (
                          <div key={item.id}>
                            <div className="flex gap-4">
                              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-50">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="mb-0.5 text-sm font-medium text-slate-600 truncate">
                                  {item.name}
                                </h3>
                                {item.variant && (
                                  <p className="mb-0.5 text-[10px] text-neutral-400 uppercase tracking-widest">
                                    {item.variant}
                                  </p>
                                )}
                                <div className="flex justify-between items-center mt-1">
                                  <p className="text-xs text-neutral-400">
                                    Qty: <span className="text-[#5B3A82]">{item.quantity}</span>
                                  </p>
                                  <p className="text-sm font-medium text-[#5B3A82]">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {index < cartItems.length - 1 && (
                              <div className="mt-4 border-t border-neutral-50"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile: Totals */}
                    <div className="py-8 space-y-4 border-b border-neutral-100 px-8">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-neutral-500">
                          Subtotal
                        </span>
                        <span className="text-sm font-medium text-slate-600">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-neutral-500">
                          Shipping
                        </span>
                        <span className="text-sm font-medium text-slate-600">
                          ${shippingCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <span className="text-lg font-medium text-[#5B3A82]">
                          Total
                        </span>
                        <span className="text-2xl font-semibold text-[#5B3A82]">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Mobile: Payment & Confirm */}
                    <div className="p-8 space-y-6">
                      <div>
                        <h3 className="mb-3 text-xs font-medium text-neutral-400 uppercase tracking-widest">
                          Payment Method
                        </h3>
                        <div className="rounded-xl border border-purple-100 bg-purple-50/20 p-4 border-dashed">
                          <p className="text-sm font-normal text-[#5B3A82] flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#5B3A82] animate-pulse"></span>
                            Cash on Delivery
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        className="w-full rounded-full bg-[#483063] px-6 py-5 text-sm font-medium text-white shadow-xl transition-all hover:bg-[#5B3A82] focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? "Processing..." : (
                          <>
                            <Lock className="w-4 h-4" />
                            Confirm Order
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

