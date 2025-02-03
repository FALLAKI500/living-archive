import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

export default function BookingForm({ onClose }) {
  const [properties, setProperties] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchCustomers();
  }, []);

  const fetchProperties = async () => {
    const { data, error } = await supabase.from("properties").select("*");
    if (error) console.error("Error fetching properties:", error);
    else setProperties(data || []);
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase.from("customers").select("*");
    if (error) console.error("Error fetching customers:", error);
    else setCustomers(data || []);
  };

  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !selectedProperty) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const property = properties.find((p) => p.id === selectedProperty);
    if (property) setTotalPrice(diffDays * property.price_per_night || 0);
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [startDate, endDate, selectedProperty]);

  const handleAddCustomer = async () => {
    if (!newCustomerName) {
      toast({ title: "Error", description: "Customer name is required", status: "error" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("customers").insert([{ name: newCustomerName }]).select();
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, status: "error" });
    } else {
      toast({ title: "Success", description: "Customer added!", status: "success" });
      setCustomers([...customers, ...data]);
      setSelectedCustomer(data[0].id);
      setNewCustomerName("");
    }
  };

  const handleBooking = async () => {
    if (!selectedProperty || !selectedCustomer || !startDate || !endDate) {
      toast({ title: "Error", description: "All fields are required", status: "error" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("bookings").insert([
      {
        property_id: selectedProperty,
        customer_id: selectedCustomer,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
      },
    ]);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, status: "error" });
    } else {
      toast({ title: "Success", description: "Booking confirmed!", status: "success" });
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Create New Booking</h2>
      
      {/* اختيار العقار */}
      <Select value={selectedProperty} onChange={setSelectedProperty} placeholder="Choose a property">
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.name} - {property.price_per_night} MAD/day
          </SelectItem>
        ))}
      </Select>

      {/* اختيار العميل */}
      <Select value={selectedCustomer} onChange={setSelectedCustomer} placeholder="Choose a customer">
        {customers.map((customer) => (
          <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
        ))}
      </Select>

      {/* إدخال عميل جديد */}
      <div className="flex gap-2">
        <Input type="text" placeholder="New customer name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
        <Button onClick={handleAddCustomer} disabled={loading}>
          {loading ? "Adding..." : "Add Customer"}
        </Button>
      </div>

      {/* إدخال تواريخ الحجز */}
      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

      <p className="text-lg font-semibold">Total Price: {totalPrice} MAD</p>

      <Button onClick={handleBooking} disabled={loading}>
        {loading ? "Processing..." : "Confirm Booking"}
      </Button>
    </div>
  );
}
