import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

old_confirm_booking_start = """  const confirmBooking = async () => {
    if (isBooking) return;
    if (!selectedProvider || !selectedService || !patientId) {
      alert("Missing booking information.");
      return;
    }
    // GPS check removed to allow booking anywhere in Kano State
    
    
    setIsBooking(true);
    try {"""

new_confirm_booking_start = """  const confirmBooking = async () => {
    if (isBooking) return;
    if (!selectedProvider || !selectedService || !patientId) {
      alert("Missing booking information.");
      return;
    }
    // GPS check removed to allow booking anywhere in Kano State
    
    console.log("=== BOOKING DEBUG START ===");
    console.log("Client UID:", patientId);
    console.log("Provider ID:", selectedProvider.id);
    console.log("Provider UID (providerId field):", selectedProvider.providerId);
    console.log("Selected service:", selectedService);
    console.log("Client location:", location);
    console.log("Payment status:", paymentMethod);
    console.log("=== BOOKING DEBUG END ===");
    
    setIsBooking(true);
    try {"""

content = content.replace(old_confirm_booking_start, new_confirm_booking_start)

old_catch_block = """    } catch (err: any) {
      console.warn("Error booking", err?.message || err, err);
      alert("BOOKING ERROR: " + (err.message || "Failed to create booking."));
    } finally {"""

new_catch_block = """    } catch (err: any) {
      console.error("=== BOOKING ERROR ===");
      console.error("BOOKING ERROR:", err);
      console.error("BOOKING ERROR CODE:", err?.code);
      console.error("BOOKING ERROR MESSAGE:", err?.message);
      console.error("=====================");
      alert("BOOKING FAILED\\n\\nError message: " + (err?.message || "Something went wrong.") + "\\nError code: " + (err?.code || "Unknown"));
    } finally {"""

content = content.replace(old_catch_block, new_catch_block)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
