"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUsers,
  FaSearch,
  FaPlus,
  FaSpinner,
  FaArrowLeft,
  FaChartBar,
  FaMoneyBillWave,
  FaPercentage,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedStoreRoute from "@/components/ProtectedStoreRoute";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

const customerGrowthData = [
  { name: "Jan", "New Customers": 12 },
  { name: "Feb", "New Customers": 19 },
  { name: "Mar", "New Customers": 10 },
  { name: "Apr", "New Customers": 13 },
  { name: "May", "New Customers": 15 },
  { name: "Jun", "New Customers": 22 },
  { name: "Jul", "New Customers": 18 },
  { name: "Aug", "New Customers": 25 },
];

const CustomerDashboard = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;

  // New state for dynamic sales data
  const [totalSales, setTotalSales] = useState(0); 

  const totalCommission = "10%";

  const fetchCustomers = async (id) => {
    if (!id) {
      toast.error("Invalid Store ID. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STORE_URL}/GetCustomersByStoreId`,
        { params: { Id: id } }
      );

      if (res.data && res.data.length > 0) {
        setCustomers(res.data);
        setStoreName(res.data[0].StoreName);
      } else {
        toast.info("No customers found for this store");
        setCustomers([]);
        setStoreName("Store");
      }
    } catch (err) {
      console.error("Error fetching customers", err);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch total sales for the store
  const fetchTotalSales = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/BalancebyStoreid?StoreID=${id}`
      );
      // Access the TotalBalance from the first item in the array
      const sales = response.data?.[0]?.TotalBalance || 0;
      setTotalSales(sales);
    } catch (error) {
      console.error("Failed to fetch total sales:", error);
      toast.error("Failed to load total sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedid = localStorage.getItem("StoreID");
    if (storedid) {
      fetchCustomers(storedid);
      fetchTotalSales(storedid); // Call the new fetch function
    } else {
      setLoading(false);
      toast.error("Store ID not found. Please log in.");
    }
  }, []);

  const filtered = customers.filter((customer) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    return (
      String(customer.Customer_Name || "").toLowerCase().includes(q) ||
      String(customer.Customer_Email || "").toLowerCase().includes(q) ||
      String(customer.Customer_phone || "").toLowerCase().includes(q) ||
      String(customer.service_name || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / customersPerPage);
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filtered.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRefresh = () => {
    const storedid = localStorage.getItem("StoreID");
    if (storedid) {
      fetchCustomers(storedid);
      fetchTotalSales(storedid); // Include the new function in refresh
    }
  };

  const handleAddCustomer = () => {
    router.push("/store/add-customer");
  };

  const cardClasses = "bg-white rounded-xl shadow-md p-6 flex flex-col items-start transition-transform transform hover:scale-105";
  const metricClasses = "text-4xl font-bold text-gray-900 mt-2";
  const labelClasses = "text-gray-500 font-medium";

  return (
    <ProtectedStoreRoute>
      <div className="min-h-screen bg-white p-4 md:p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-6"
        >
          <FaArrowLeft />
          Back to Store Dashboard
        </button>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {storeName || "Store"} Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              A comprehensive overview of your customer data.
            </p>
          </div>

          {/* Dashboard Overview: Status Cards & Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Customers Card */}
            <div className={cardClasses}>
              <div className="flex items-center justify-between w-full">
                <FaUsers size={28} className="text-indigo-500" />
                <p className={labelClasses}>Total Customers</p>
              </div>
              <h2 className={metricClasses}>{customers.length}</h2>
            </div>

            {/* Total Sales Card */}
            <div className={cardClasses}>
              <div className="flex items-center justify-between w-full">
                <FaMoneyBillWave size={28} className="text-green-500" />
                <p className={labelClasses}>Total Sales</p>
              </div>
              <h2 className={metricClasses}>
                {totalSales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </h2>
            </div>

            {/* Commission Card */}
            <div className={cardClasses}>
              <div className="flex items-center justify-between w-full">
                <FaPercentage size={28} className="text-yellow-500" />
                <p className={labelClasses}>Commission Rate</p>
              </div>
              <h2 className={metricClasses}>{totalCommission}</h2>
            </div>
          </div>

          {/* Customer Growth Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
              <FaChartBar className="mr-3 text-purple-600" /> Customer Growth
              Over Time
            </h3>
            <p className="text-gray-500 mb-6">
              Visualizing new customer sign-ups by month.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={customerGrowthData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Legend />
                <Bar dataKey="New Customers" fill="#8884d8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Main Content: Search & Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, email, phone, or service..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <FaSpinner className={`${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                 <Link
              href="/store/addCustomer"
                  onClick={handleAddCustomer}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaPlus />
                  Add Customer
                </Link>
              </div>
            </div>

            {/* Table */}
            <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
              <FaUsers className="mr-2" /> Customer List
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-4xl text-indigo-500" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-gray-600">
                        <th className="p-3 bg-gray-50">ID</th>
                        <th className="p-3 bg-gray-50">Name</th>
                        <th className="p-3 bg-gray-50">Email</th>
                        <th className="p-3 bg-gray-50">Phone</th>
                        <th className="p-3 bg-gray-50">Service</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCustomers.length > 0 ? (
                        currentCustomers.map((customer) => (
                          <tr
                            key={customer.CustomerID}
                            className="hover:bg-gray-50 text-sm border-t"
                          >
                            <td className="p-3">{customer.CustomerID}</td>
                            <td className="p-3">{customer.Customer_Name}</td>
                            <td className="p-3">{customer.Customer_Email}</td>
                            <td className="p-3">{customer.Customer_phone}</td>
                            <td className="p-3">{customer.service_name}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-gray-500 border-t"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <FaUsers className="text-4xl text-gray-300" />
                              <p>No customers found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 border rounded-lg ${
                          currentPage === index + 1
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    </ProtectedStoreRoute>
  );
};

export default CustomerDashboard;