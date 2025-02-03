import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// إعداد اتصال Supabase
const supabase = createClient(
  "https://your-supabase-url.supabase.co",
  "your-anon-key"
);

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) console.error("Error fetching customers:", error);
      else setCustomers(data);
    };

    fetchCustomers();
  }, []);

  return (
    <div className="container">
      <h2>Customers</h2>
      <input type="text" placeholder="Search by name, phone, or city..." />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>City</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.city}</td>
              <td>{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
