"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FaStore, FaLock, FaEye, FaEyeSlash, FaSpinner, FaUsers, FaChartLine } from "react-icons/fa";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../components/LoadingSpinner";
import { customerLogin } from '../app/store/APIServices'; // Importing the API service
import { useStoreAuth } from "@/context/StoreAuthContext";

const StoreLoginForm = () => {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useStoreAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/store");
    }
  }, [isAuthenticated, loading, router]);
  
  const initialValues = {
    storeId: "", 
    password: "",
  };

  const validationSchema = Yup.object({
    storeId: Yup.string()
      .required("Store ID is required")
      .min(3, "Store ID must be at least 3 characters")
      .max(50, "Store ID must be less than 50 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const customerdata = { 
        GeneratedStoreID: values.storeId, 
        StorePassword: values.password 
      };

      const res = await customerLogin(customerdata);

      if (res?.status === 1) {
        // Store login info
        localStorage.setItem('EmployeeID', res.EmployeeID);
        localStorage.setItem('StoreID', res.StoreID);
        
        // Store login history
        const prevLogins = JSON.parse(localStorage.getItem('AllLogins')) || [];
        prevLogins.push({ EmployeeID: res.EmployeeID, StoreID: res.StoreID, time: new Date().toISOString() });
        localStorage.setItem('AllLogins', JSON.stringify(prevLogins));
        
        // Store current login object
        localStorage.setItem('CurrentLogin', JSON.stringify({ EmployeeID: res.EmployeeID, StoreID: res.StoreID }));
        
        const storeInfo = {
          username: res.StoreID,
          loginTime: new Date().toISOString(),
        };
        const token = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        login(storeInfo, token);
        toast.success("Login successful! Redirecting to dashboard...", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
      } else {
        toast.error("Login failed. Please check your credentials.", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please check your connection and try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading..." fullScreen={true} />;
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src="/LogoLight.jpeg" alt="Logo" className="h-10 w-10 rounded-full" />
                <span className="ml-3 text-xl font-bold text-gray-800">Store Management System</span>
              </div>
              <div className="text-sm font-bold text-gray-600">
                Store Portal
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Login Form */}
            <div className="max-w-md w-full mx-auto">
              {/* Card Container */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                  <div className="relative mb-6">
                    <img 
                      src="/LogoLight.jpeg" 
                      alt="Logo" 
                      className="size-32 mx-auto rounded-full shadow-lg border-4 border-white"
                    />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Store Login</h1>
                  <p className="text-gray-600">Welcome back! Please sign in to your store account.</p>
                </div>

                {/* Form */}
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={onSubmit}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form className="space-y-6">
                      {/* Store ID Field */}
                      <div className="space-y-2">
                        <label htmlFor="storeId" className="block text-sm font-medium text-gray-700">
                          Store ID
                        </label>
                        <div className="relative">
                          <FaStore className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                          <Field
                            id="storeId"
                            name="storeId"
                            type="text"
                            placeholder="Enter your store ID"
                            className={`pl-12 pr-4 py-3 w-full border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                              errors.storeId && touched.storeId
                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="storeId"
                          component="div"
                          className="text-red-500 text-sm flex items-center gap-1"
                        />
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <div className="relative">
                          <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                          <Field
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className={`pl-12 pr-12 py-3 w-full border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                              errors.password && touched.password
                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                          </button>
                        </div>
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-red-500 text-sm flex items-center gap-1"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                          isSubmitting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <FaSpinner className="animate-spin text-lg" />
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </Form>
                  )}
                </Formik>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Secure store access portal
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Features */}
            <div className="hidden lg:block">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Store Management
                    </span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    Streamline your business operations with our comprehensive store management system. 
                    Manage stores, customers, and analytics all in one place.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid gap-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <FaStore className="text-xl text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Store Management</h3>
                        <p className="text-gray-600">Efficiently manage multiple stores with comprehensive tools</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <FaUsers className="text-xl text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Customer Management</h3>
                        <p className="text-gray-600">Build strong relationships with your customers</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <FaChartLine className="text-xl text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Analytics & Reports</h3>
                        <p className="text-gray-600">Make data-driven decisions with comprehensive insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-16 h-16 bg-indigo-300 rounded-full opacity-10 animate-bounce"></div>
      </div>
    </>
  );
};

export default StoreLoginForm;