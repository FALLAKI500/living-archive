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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  // لإضافة عميل جديد
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  useEffect(() => {
    fetchProperties();
    fetchCustomers();
  }, []);

  // جلب قائمة العقارات
  const fetchProperties = async () => {
    const { data, error } = await supabase.from("properties").select("*");
    if (error) console.error("Error fetching properties:", error);
    else setProperties(data || []);
  };

  // جلب قائمة العملاء
  const fetchCustomers = async () => {
    const { data, error } = await supabase.from("customers").select("*");
    if (error) console.error("Error fetching customers:", error);
    else setCustomers(data || []);
  };

  // حساب السعر الإجمالي بناءً على عدد الأيام
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

  // إنشاء الحجز مع تمرير معرف العميل
  const handleBooking = async () => {
    if (!selectedProperty || !selectedCustomer || !startDate || !endDate) {
      toast({ title: "Error", description: "All fields are required", status: "error" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("bookings").insert([
      {
        property_id: selectedProperty,
        customer_id: selectedCustomer, // ✅ تخزين معرف العميل في قاعدة البيانات
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

  // إضافة عميل جديد
  const handleAddCustomer = async () => {
    if (!newCustomerName || !newCustomerPhone) {
      toast({ title: "Error", description: "Please enter customer name and phone number", status: "error" });
      return;
    }

    const { data, error } = await supabase.from("customers").insert([
      { name: newCustomerName, phone: newCustomerPhone }
    ]).select();

    if (error) {
      console.error("Error adding customer:", error);
      toast({ title: "Error", description: error.message, status: "error" });
    } else {
      setCustomers([...customers, ...data]); // تحديث قائمة العملاء
      setSelectedCustomer(data[0].id); // تحديد العميل الجديد تلقائيًا
      setShowAddCustomerModal(false); // إغلاق النموذج
      toast({ title: "Success", description: "New customer added!", status: "success" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Create New Booking</h2>

      {/* ✅ اختيار العقار */}
      <Select value={selectedProperty} onChange={setSelectedProperty} placeholder="Choose a property">
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.name} - {property.price_per_night} MAD/day
          </SelectItem>
        ))}
      </Select>

      {/* ✅ اختيار العميل */}
      <Select value={selectedCustomer} onChange={setSelectedCustomer} placeholder="Choose a customer">
        {customers.map((customer) => (
          <SelectItem key={customer.id} value={customer.id}>
            {customer.name} - {customer.phone}
          </SelectItem>
        ))}
      </Select>

      {/* ✅ زر إضافة عميل جديد */}
      <Button onClick={() => setShowAddCustomerModal(true)}>+ Add New Customer</Button>

      {/* ✅ اختيار التواريخ */}
      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

      <p className="text-lg font-semibold">Total Price: {totalPrice} MAD</p>

      <Button onClick={handleBooking} disabled={loading}>
        {loading ? "Processing..." : "Confirm Booking"}
      </Button>

      {/* ✅ نموذج إضافة عميل جديد */}
      {showAddCustomerModal && (
        <div className="modal bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-2">Add New Customer</h2>
          <Input type="text" placeholder="Customer Name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
          <Input type="text" placeholder="Phone Number" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} />
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleAddCustomer}>Save</Button>
            <Button onClick={() => setShowAddCustomerModal(false)} variant="secondary">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
