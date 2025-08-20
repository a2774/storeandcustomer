"use client";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMoneyBill,
  FaUpload,
  FaSpinner,
  FaArrowLeft,
  FaFileAlt,
  FaLaptop,
} from "react-icons/fa";

// Centralize environment variables for clarity
const UPLOAD_URL = process.env.NEXT_PUBLIC_STORE_URL + "/uploads";
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_SERVICES_URL;
const ASSETS_BASE_URL =
  process.env.NEXT_PUBLIC_ASSETS_URL || "http://122.160.25.202/micron/app/api";

// Define API paths as constants
const API_ENDPOINTS = {
  GET_SERVICES: `${BACKEND_BASE_URL}/GetProductService`,
  GET_CUSTOMER_BY_ID: `${BACKEND_BASE_URL}/GetById`,
  UPDATE_CUSTOMER: `${BACKEND_BASE_URL}/CustumerUpdate`,
};

function UpdateCustomer() {
  const { id } = useParams();
  const navigate = useRouter();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    Customer_AadharNumber: "",
    Customer_PanNumber: "",
    Customer_ProductAmount: "",
    customer_aadhar: "",
    customer_pancard: "",
    Productservices_Id: "",
  });

  const [product, setProduct] = useState([]);
  const [uploading, setUploading] = useState({ pan: false, aadhar: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file uploads
  const handleFileUpload = async (e, uploadType) => {
    const file = e.target.files[0] || null;
    const formKey =
      uploadType === "Pan" ? "customer_pancard" : "customer_aadhar";

    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPG, PNG, GIF allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("File too large. Max size is 1MB.");
      e.target.value = "";
      return;
    }

    setUploading((prev) => ({ ...prev, [uploadType.toLowerCase()]: true }));
    const formDataPayload = new FormData();
    formDataPayload.append("file", file);
    formDataPayload.append("uploadtype", uploadType);

    try {
      const res = await axios.post(UPLOAD_URL, formDataPayload);
      if (res.data?.success && res.data?.fileName) {
        setFormData((prev) => ({ ...prev, [formKey]: res.data.fileName }));
        toast.success(`${uploadType} image uploaded successfully!`);
      } else {
        toast.error(res.data?.error || "Upload failed.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err.message || "Upload failed."
      );
    } finally {
      setUploading((prev) => ({ ...prev, [uploadType.toLowerCase()]: false }));
    }
  };

  // Fetch data on component load
  useEffect(() => {
    // Fetch product services
    const fetchProductServices = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_SERVICES);
        setProduct(response.data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services.");
      }
    };
    fetchProductServices();

    // Fetch customer data
    const fetchCustomer = async () => {
      if (!id) return;
      try {
        const response = await axios.get(
          `${API_ENDPOINTS.GET_CUSTOMER_BY_ID}/${id}`
        );
        const customer = response.data[0];
        if (customer) {
          setFormData({
            customer_name: customer.Customer_Name || "",
            customer_email: customer.Customer_Email || "",
            customer_phone: customer.Customer_Phone || "",
            Customer_AadharNumber: customer.Customer_AadharNumber || "",
            Customer_PanNumber: customer.Customer_PanNumber || "",
            Customer_ProductAmount: customer.Customer_ProductAmount || "",
            customer_aadhar: customer.Customer_Aadhar || "",
            customer_pancard: customer.Customer_PanCard || "",
            Productservices_Id: customer.Productservices_Id || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch customer data.");
      }
    };
    fetchCustomer();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = [
      "customer_name",
      "customer_email",
      "Productservices_Id",
      "customer_pancard",
      "customer_aadhar",
    ];
    if (requiredFields.some((field) => !formData[field])) {
      toast.error("Please fill in all required fields and upload both images.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      CustomerID: id,
      Customer_Name: formData.customer_name,
      Customer_Email: formData.customer_email,
      Customer_phone: formData.customer_phone,
      Customer_AadharNumber: formData.Customer_AadharNumber,
      Customer_PanNumber: formData.Customer_PanNumber,
      Customer_ProductAmount: formData.Customer_ProductAmount,
      Customer_Aadhar: formData.customer_aadhar,
      Customer_PanCard: formData.customer_pancard,
      Productservices_Id: formData.Productservices_Id,
    };

    try {
      const response = await axios.put(API_ENDPOINTS.UPDATE_CUSTOMER, payload);
      if (response.status === 200) {
        toast.success("Customer details updated successfully!");
        navigate.push("/admin/customers/manageCustomers");
      } else {
        toast.error("Failed to update customer. Unexpected server response.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";
      toast.error(`Update failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputIcon = (name) => {
    switch (name) {
      case "customer_name":
        return <FaUser />;
      case "customer_email":
        return <FaEnvelope />;
      case "customer_phone":
        return <FaPhone />;
      case "Customer_AadharNumber":
        return <FaIdCard />;
      case "Customer_PanNumber":
        return <FaIdCard />;
      case "Customer_ProductAmount":
        return <FaMoneyBill />;
      default:
        return null;
    }
  };

  const getImageUrl = (fileName) => {
    if (!fileName) return null;
    return fileName.startsWith("http")
      ? fileName
      : `${ASSETS_BASE_URL}/assets/img/Customer/${fileName}`;
  };

  return (
    <ProtectedStoreRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate.back()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-6"
          >
            <FaArrowLeft />
            Back
          </button>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mx-auto">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
                <FaUser className="mr-3" />
                Update Customer Information
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Services Dropdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="Productservices_Id"
                      className="text-sm font-semibold text-gray-700 mb-2 flex items-center"
                    >
                      <FaLaptop className="mr-2 text-indigo-500" />
                      Services *
                    </label>
                    <div className="relative">
                      <select
                        id="Productservices_Id"
                        name="Productservices_Id"
                        value={formData.Productservices_Id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      >
                        <option value="">-- Select a Service --</option>
                        {product.map((service) => (
                          <option
                            key={service.Productservices_Id}
                            value={service.Productservices_Id}
                          >
                            {service.service_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Customer Name",
                      name: "customer_name",
                      type: "text",
                      placeholder: "Enter Customer Name",
                    },
                    {
                      label: "Customer Email",
                      name: "customer_email",
                      type: "email",
                      placeholder: "Enter Customer Email",
                    },
                    {
                      label: "Customer Phone",
                      name: "customer_phone",
                      type: "tel",
                      placeholder: "Enter Customer Phone",
                    },
                    {
                      label: "Aadhar Number",
                      name: "Customer_AadharNumber",
                      type: "text",
                      placeholder: "Enter Aadhar Number",
                    },
                    {
                      label: "PAN Number",
                      name: "Customer_PanNumber",
                      type: "text",
                      placeholder: "Enter PAN Number",
                    },
                    {
                      label: "Product Amount",
                      name: "Customer_ProductAmount",
                      type: "number",
                      placeholder: "Enter Amount",
                      min: 0,
                      step: "any",
                    },
                  ].map(({ label, name, type, placeholder, min, step }) => (
                    <div key={name}>
                      <label
                        htmlFor={name}
                        className="text-sm font-semibold text-gray-700 mb-2 flex items-center"
                      >
                        {getInputIcon(name)}
                        <span className="ml-2">{label} *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={type}
                          id={name}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                          min={min}
                          step={step}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {getInputIcon(name)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aadhar Upload */}
                  <div>
                    <label
                      htmlFor="aadharUpload"
                      className="text-sm font-semibold text-gray-700 mb-2 flex items-center"
                    >
                      <FaFileAlt className="mr-2 text-indigo-500" />
                      Aadhar Card Image *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="aadharUpload"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "Aadhar")}
                        className="hidden"
                      />
                      <label
                        htmlFor="aadharUpload"
                        className={`w-full px-4 py-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-center ${
                          formData.customer_aadhar
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                        }`}
                      >
                        {uploading.aadhar ? (
                          <FaSpinner className="animate-spin mr-2 text-indigo-500" />
                        ) : (
                          <FaUpload className="mr-2 text-indigo-500" />
                        )}
                        {formData.customer_aadhar
                          ? "Aadhar Card Uploaded ✓"
                          : "Upload Aadhar Card"}
                      </label>
                    </div>
                    {formData.customer_aadhar && (
                      <img
                        src={getImageUrl(formData.customer_aadhar)}
                        alt="Aadhar preview"
                        className="mt-4 w-48 h-32 object-contain border rounded-md shadow-sm"
                      />
                    )}
                  </div>

                  {/* PAN Upload */}
                  <div>
                    <label
                      htmlFor="panUpload"
                      className="text-sm font-semibold text-gray-700 mb-2 flex items-center"
                    >
                      <FaFileAlt className="mr-2 text-indigo-500" />
                      PAN Card Image *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="panUpload"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "Pan")}
                        className="hidden"
                      />
                      <label
                        htmlFor="panUpload"
                        className={`w-full px-4 py-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-center ${
                          formData.customer_pancard
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                        }`}
                      >
                        {uploading.pan ? (
                          <FaSpinner className="animate-spin mr-2 text-indigo-500" />
                        ) : (
                          <FaUpload className="mr-2 text-indigo-500" />
                        )}
                        {formData.customer_pancard
                          ? "PAN Card Uploaded ✓"
                          : "Upload PAN Card"}
                      </label>
                    </div>
                    {formData.customer_pancard && (
                      <img
                        src={getImageUrl(formData.customer_pancard)}
                        alt="PAN preview"
                        className="mt-4 w-48 h-32 object-contain border rounded-md shadow-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white transition-all duration-200 ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-3" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaUser className="mr-3" />
                        Update Customer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </ProtectedStoreRoute>
  );
}

export default UpdateCustomer;
