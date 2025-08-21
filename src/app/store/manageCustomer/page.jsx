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
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedStoreRoute from "@/components/ProtectedStoreRoute";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CustomersByStore = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;

  // 🔹 Fetch customers for the store
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

  useEffect(() => {
    const storedid = localStorage.getItem("StoreID");
    if (storedid) {
      fetchCustomers(storedid);
    } else {
      setLoading(false);
      toast.error("Store ID not found. Please log in.");
    }
  }, []);

  // 🔹 Filter customers by query
  const filtered = customers.filter((customer) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    return (
      String(customer.Customer_Name || "")
        .toLowerCase()
        .includes(q) ||
      String(customer.Customer_Email || "")
        .toLowerCase()
        .includes(q) ||
      String(customer.Customer_phone || "")
        .toLowerCase()
        .includes(q) ||
      String(customer.service_name || "")
        .toLowerCase()
        .includes(q)
    );
  });

  // 🔹 Pagination logic
  const totalPages = Math.ceil(filtered.length / customersPerPage);
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filtered.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 🔹 Action Handlers
  const handleView = (customerId) => {
    router.push(`/store/view/${customerId}`);
  };

  const handleDelete = async (customerId) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/DeleteCustomer`,
        { params: { id: customerId } }
      );
      toast.success("Customer deleted successfully");
      setCustomers(customers.filter((c) => c.CustomerID !== customerId));
    } catch (err) {
      console.error("Delete error", err);
      toast.error("Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const storedid = localStorage.getItem("StoreID");
    fetchCustomers(storedid);
  };

  const handleAddCustomer = () => {
    router.push("/store/addCustomer");
  };

  // 🔹 Export to Excel function
  const exportToExcel = () => {
    const dataToExport = filtered.map((customer) => ({
      "Customer ID": customer.CustomerID,
      "Customer Name": customer.Customer_Name,
      Email: customer.Customer_Email,
      Phone: customer.Customer_phone,
      "Service Name": customer.service_name,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, `customers_for_${storeName}_store.xlsx`);
  };

  // 🔹 Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Customers for ${storeName} Store`, 14, 20);

    const tableColumn = ["ID", "Name", "Email", "Phone", "Service"];
    const tableRows = filtered.map((customer) => [
      customer.CustomerID,
      customer.Customer_Name,
      customer.Customer_Email,
      customer.Customer_phone,
      customer.service_name,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        cellPadding: 3,
        fontSize: 10,
        valign: "middle",
        halign: "left",
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [52, 58, 64],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: "bold",
      },
    });

    doc.save(`customers_for_${storeName}_store.pdf`);
  };

  return (
    <ProtectedStoreRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-4"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Customers of {storeName || "Store"}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage and view all registered customers of this store
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search customers..."
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
                <button
                  onClick={handleAddCustomer}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaPlus />
                  Add Customer
                </button>
              </div>
            </div>
            {/* New Export Buttons */}
            <div className="flex justify-end gap-2 w-full lg:w-auto mt-4 lg:mt-0">
              <button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FaUsers className="mr-3" />
                Customer List
              </h2>
            </div>

            <div className="p-6">
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
                          <th className="p-3 bg-gray-50 text-center">
                            Actions
                          </th>
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
                              <td className="p-3 text-center flex justify-center gap-2">
                                <button
                                  onClick={() =>
                                    handleView(customer.CustomerID)
                                  }
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-1"
                                >
                                  <FaEye /> View
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(customer.CustomerID)
                                  }
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-1"
                                >
                                  <FaTrash /> Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
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

                  {/* Pagination */}
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
        </div>
        <ToastContainer />
      </div>
    </ProtectedStoreRoute>
  );
}
export default CustomersByStore;