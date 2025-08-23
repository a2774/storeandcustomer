"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image"; 
import {
  FaArrowLeft,
  FaSpinner,
  FaUser,
  FaIdCard,
  FaCreditCard,
  FaEnvelope,
  FaPhone,
  FaDollarSign,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomerDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams(); 

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const fetchCustomer = async (customerId) => {
    if (!customerId) {
      setLoading(false);
      setError("Customer ID is missing from the URL.");
      toast.error("Invalid URL: Customer ID missing.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/GetById`,
        { params: { id: customerId } }
      );
      const data = response.data[0]
      console.log("responce", data)

      if (response.data && response.data.length > 0) {
        setCustomer(response.data[0]);
      } else {
        setError("Customer not found.");
        toast.info("No customer found with this ID.");
        setCustomer(null);
      }
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError("Failed to load customer details. Please try again.");
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id]);

  // 🔹 Helper function to construct image URLs
  const getImageUrl = (filename) => {
    if (!filename) return null;
    return `http://122.160.25.202/micron/app/Images/${filename}`;
  };

  // 🔹 Helper component for detail items
  const DetailItem = ({ label, value, icon }) => (
    <div className="flex items-start sm:items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      {icon && <span className="text-indigo-500 text-lg">{icon}</span>}
      <div className="flex flex-col sm:flex-row sm:items-center w-full">
        <span className="font-semibold text-gray-600 sm:w-1/3">{label}:</span>
        <span className="text-gray-900 mt-1 sm:mt-0 sm:w-2/3 break-words">
          {value || "N/A"}
        </span>
      </div>
    </div>
  );

  // 🔹 Helper component for document cards
  const DocumentCard = ({ title, src }) => {
    if (!src) return null;
    return (
      <div className="bg-gray-50 rounded-lg overflow-hidden shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-4 flex justify-center">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-h-80 overflow-hidden rounded-lg border border-gray-300 hover:shadow-xl transition-shadow"
          >
            <Image
              src={src}
              alt={title}
              width={500}
              height={300}
              className="object-cover w-full h-full"
              unoptimized
            />
          </a>
        </div>
      </div>
    );
  };

  // 🔹 UI States
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-xl text-gray-700 mb-4">
            Customer details are not available.
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const aadharImageUrl = getImageUrl(customer.Customer_Aadhar);
  const panImageUrl = getImageUrl(customer.Customer_PanCard);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <FaArrowLeft />
            <span className="text-lg">Back</span>
          </button>
        </div>
        <div className="mb-5">
          {" "}
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Customer Details
          </h1>
        </div>
        {/* Customer Details Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaUser /> {customer.Customer_Name || "Customer"}
            </h1>
            <p className="text-gray-200 text-sm mt-1">
              Details for Customer ID: {customer.CustomerID}
            </p>
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-indigo-600 mb-4 flex items-center">
                <FaUser className="mr-2" /> Personal Information
              </h2>
              <DetailItem
                label="ID"
                value={customer.CustomerID}
                icon={<FaIdCard />}
              />
              <DetailItem
                label="Name"
                value={customer.Customer_Name}
                icon={<FaUser />}
              />
              <DetailItem
                label="Email"
                value={customer.Customer_Email}
                icon={<FaEnvelope />}
              />
              <DetailItem
                label="Phone"
                value={customer.Customer_Phone}
                icon={<FaPhone />}
              />
              <DetailItem
                label="Aadhar No."
                value={customer.Customer_AadharNumber}
                icon={<FaCreditCard />}
              />
              <DetailItem
                label="PAN No."
                value={customer.Customer_PanNumber}
                icon={<FaIdCard />}
              />
              <DetailItem
                label="Service"
                value={customer.service_name}
                icon={<FaFileAlt />}
              />
              <DetailItem
                label="Product Amount"
                value={`$${customer.Customer_ProductAmount}`}
                icon={<FaDollarSign />}
              />
              <DetailItem
                label="Date Joined"
                value={new Date(customer.Customer_Date).toLocaleDateString()}
                icon={<FaCalendarAlt />}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-indigo-600 mb-4 flex items-center">
                <FaFileAlt className="mr-2" /> Documents
              </h2>
              {/* Image Preview Sections */}
              {aadharImageUrl && (
                <DocumentCard title="Aadhar Card"  src={`${process.env.NEXT_PUBLIC_IMAGE_PREVIEW}/${customer.Customer_Aadhar}`} />
              )}
              {panImageUrl && (
                <DocumentCard title="PAN Card" src={`${process.env.NEXT_PUBLIC_IMAGE_PREVIEW}/${customer.Customer_PanCard}`} />
              )}
              {!aadharImageUrl && !panImageUrl && (
                <p className="text-gray-500 p-3 bg-gray-50 rounded-lg">
                  No documents uploaded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CustomerDetailsPage;
