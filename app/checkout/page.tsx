"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
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
  "Mount Lebanon": ["Aley", "Baabda", "Chouf","Matn","Keserwan","Byblos"],
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
          <h1 className="mb-8 text-center text-2xl font-semibold text-neutral-900 md:text-3xl">
            Checkout
          </h1>

          {isSuccess ? (
            <div className="mx-auto max-w-2xl">
              <div className="rounded-lg border border-green-200 bg-white p-8 text-center">
                <div className="mb-4 text-6xl">✓</div>
                <h2 className="mb-4 text-2xl font-semibold text-green-900">
                  Order Sent Successfully!
                </h2>
                <p className="mb-6 text-lg text-green-800">
                  Your order has been sent successfully. We will contact you soon.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="w-full rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-7xl">
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-[60%_40%]">
                {/* Left Column: Customer Information */}
                <div className="space-y-6 bg-neutral-50 -mx-4 px-4 py-6 lg:mx-0 lg:px-6 lg:py-8 rounded-lg lg:rounded-none">
                  {/* Customer Information Section */}
                  <div>
                    <h2 className="mb-6 text-lg font-semibold text-neutral-900">
                      Customer Information
                    </h2>

                    <div className="space-y-6">
                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="fullName"
                          className="mb-1.5 block text-sm text-neutral-600"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full rounded-md border bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-800 ${
                            errors.fullName ? "border-red-500" : "border-neutral-300"
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label
                          htmlFor="phoneNumber"
                          className="mb-1.5 block text-sm text-neutral-600"
                        >
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handlePhoneInputChange}
                          onBlur={handlePhoneBlur}
                          onKeyDown={handlePhoneKeyDown}
                          className={`w-full rounded-md border bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-800 ${
                            errors.phoneNumber
                              ? "border-red-500"
                              : "border-neutral-300"
                          }`}
                          placeholder="+961 70 717 397"
                        />
                        {errors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Section */}
                  <div>
                    <h3 className="mb-6 text-lg font-semibold text-neutral-900">
                      Delivery
                    </h3>

                    <div className="space-y-6">
                      {/* Country/Region */}
                      <div>
                        <label
                          htmlFor="country"
                          className="mb-1.5 block text-sm text-neutral-600"
                        >
                          Country/Region <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                          disabled
                        >
                          <option value="Lebanon">Lebanon</option>
                        </select>
                      </div>

                      {/* Governorate */}
                      <div>
                        <label
                          htmlFor="governorate"
                          className="mb-1.5 block text-sm text-neutral-600"
                        >
                          Governorate <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="governorate"
                          name="governorate"
                          value={formData.governorate}
                          onChange={handleInputChange}
                          className={`w-full rounded-md border bg-white px-4 py-3 text-neutral-900 focus:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-800 ${
                            errors.governorate
                              ? "border-red-500"
                              : "border-neutral-300"
                          }`}
                        >
                          <option value="">Select Governorate</option>
                          {Object.keys(lebanonData).map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                        </select>
                        {errors.governorate && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.governorate}
                          </p>
                        )}
                      </div>

                      {/* District */}
                      <div>
                        <label
                          htmlFor="district"
                          className="mb-1.5 block text-sm text-neutral-600"
                        >
                          District <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="district"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          disabled={!formData.governorate}
                          className={`w-full rounded-md border bg-white px-4 py-3 text-neutral-900 focus:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:bg-neutral-50 disabled:cursor-not-allowed ${
                            errors.district
                              ? "border-red-500"
                              : "border-neutral-300"
                          }`}
                        >
                          <option value="">
                            {formData.governorate
                              ? "Select District"
                              : "Select Governorate first"}
                          </option>
                          {availableDistricts.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                        {errors.district && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.district}
                          </p>
                        )}
                      </div>

                      {/* City/Town */}
                      <div>
                        <label
                          htmlFor="city"
                          className="mb-1.5 block text-sm text-neutral-600"
                        >
                          City / Town <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full rounded-md border bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-800 ${
                            errors.city ? "border-red-500" : "border-neutral-300"
                          }`}
                          placeholder="Enter city or town"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Details Section */}
                  <div>
                    <h3 className="mb-6 text-lg font-semibold text-neutral-900">
                      Address Details
                    </h3>

                    <div className="space-y-6">
                      {/* Street Name */}
                      <div>
                        <label
                          htmlFor="streetName"
                          className="mb-1.5 block text-sm text-neutral-600"
                        >
                          Street Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="streetName"
                          name="streetName"
                          value={formData.streetName}
                          onChange={handleInputChange}
                          className={`w-full rounded-md border bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-800 ${
                            errors.streetName
                              ? "border-red-500"
                              : "border-neutral-300"
                          }`}
                          placeholder="Enter street name"
                        />
                        {errors.streetName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.streetName}
                          </p>
                        )}
                      </div>

                      {/* Building Name */}
                      <div>
                        <label
                          htmlFor="buildingName"
                          className="mb-1.5 block text-sm text-neutral-600"
                        >
                          Building Name
                        </label>
                        <input
                          type="text"
                          id="buildingName"
                          name="buildingName"
                          value={formData.buildingName}
                          onChange={handleInputChange}
                          className="w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                          placeholder="Enter building name (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method Section */}
                  <div>
                    <h3 className="mb-6 text-lg font-semibold text-neutral-900">
                      Shipping method
                    </h3>
                    <div className="rounded-md border border-neutral-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-normal text-neutral-900">
                          Deliver All Over Lebanon
                        </span>
                        <span className="text-base font-normal text-neutral-900">
                          ${shippingCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary & Payment - Desktop */}
                <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-lg border border-neutral-200 bg-white shadow-sm p-6">
                    <h2 className="mb-6 text-lg font-semibold text-neutral-900">
                      Order Summary
                    </h2>

                    <div className="mb-6 space-y-4">
                      {cartItems.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex gap-4">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="mb-0.5 text-sm font-semibold text-neutral-900">
                                {item.name}
                              </h3>
                              {item.variant && (
                                <p className="mb-1 text-xs text-neutral-500">
                                  {item.variant}
                                </p>
                              )}
                              <p className="mb-1 text-xs text-neutral-600">
                                Quantity: {item.quantity}
                              </p>
                              <p className="text-sm font-medium text-neutral-900 text-right">
                                ${item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {index < cartItems.length - 1 && (
                            <div className="mt-4 border-t border-neutral-200"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6 border-t border-neutral-200 pt-6">
                      <h3 className="mb-4 text-base font-semibold text-neutral-900">
                        Payment Method
                      </h3>
                      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-sm font-normal text-neutral-900">
                          Cash on Delivery
                        </p>
                      </div>
                    </div>

                    {/* Order Summary Totals */}
                    <div className="mb-6 border-t border-neutral-200 pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-normal text-neutral-600">
                          Subtotal
                        </span>
                        <span className="text-sm font-normal text-neutral-900">
                          ${subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-normal text-neutral-600">
                          Shipping
                        </span>
                        <span className="text-sm font-normal text-neutral-900">
                          ${shippingCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                        <span className="text-base font-semibold text-neutral-900">
                          Total
                        </span>
                        <span className="text-base font-semibold text-neutral-900">
                          ${totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Confirm Order Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isSuccess}
                      className="w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending..." : "Confirm Order"}
                    </button>
                  </div>
                </div>

                {/* Mobile: Order Summary */}
                <div className="lg:hidden">
                  {/* Mobile: Collapsible Header - Products Only */}
                  <button
                    type="button"
                    onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-transparent border-b border-neutral-200 transition-colors duration-200 hover:bg-neutral-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-semibold text-neutral-900">
                        Order Summary
                      </h2>
                     
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-neutral-600 transition-transform duration-200 ease-in-out ${
                        isOrderSummaryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Mobile: Collapsible Products Dropdown */}
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      isOrderSummaryOpen
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="py-4 space-y-4 border-b border-neutral-200">
                      {cartItems.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex gap-3 px-4">
                            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                            
                              <h3 className="mb-0.5 text-sm font-semibold text-neutral-900">
                                {item.name}
                              </h3>
                              {item.variant && (
                                <p className="mb-0.5 text-xs text-neutral-500">
                                  {item.variant}
                                </p>
                              )}
                              <p className="mb-1 text-xs text-neutral-600">
                                Quantity: {item.quantity}
                              </p>
                              <p className="text-sm font-medium text-neutral-900 text-right">
                                ${item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {index < cartItems.length - 1 && (
                            <div className="mt-3 border-t border-neutral-100"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile: Always Visible - Payment Method */}
                  <div className="py-4 border-b border-neutral-200">
                    <h3 className="mb-3 text-sm font-semibold text-neutral-900 px-4">
                      Payment Method
                    </h3>
                    <div className="mx-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <p className="text-sm font-normal text-neutral-900">
                        Cash on Delivery
                      </p>
                    </div>
                  </div>

                  {/* Mobile: Always Visible - Totals */}
                  <div className="py-4 space-y-2 border-b border-neutral-200">
                    <div className="flex items-center justify-between px-4">
                      <span className="text-sm font-normal text-neutral-500">
                        Subtotal
                      </span>
                      <span className="text-sm font-normal text-neutral-700">
                        ${subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4">
                      <span className="text-sm font-normal text-neutral-500">
                        Shipping
                      </span>
                      <span className="text-sm font-normal text-neutral-700">
                        ${shippingCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200 px-4">
                      <span className="text-base font-semibold text-neutral-900">
                        Total
                      </span>
                      <span className="text-base font-semibold text-neutral-900">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Mobile: Always Visible - Confirm Order Button */}
                  <div className="p-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || isSuccess}
                      className="w-full rounded-md bg-black px-6 py-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending..." : "Confirm Order"}
                    </button>
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

