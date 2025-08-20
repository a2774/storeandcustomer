"use client";
import Link from "next/link";
import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaStore,
  FaUsers,
  FaBox,
  FaSignInAlt,
  FaUserPlus,
  FaBars,
  FaShoppingCart,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  IoIosArrowDown,
  IoMdAddCircle,
  IoMdPeople,
  IoMdCart,
} from "react-icons/io";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useStoreAuth } from "@/context/StoreAuthContext";

const Sidebar = ({ onNavigate = () => {} }) => {
  const [openStores, setOpenStores] = useState(false);
  const [openCustomers, setOpenCustomers] = useState(false);
  const { logout, adminData } = useStoreAuth();
  const router = useRouter();

  const toggleStores = () => {
    setOpenStores(!openStores);
  };

  const toggleCustomers = () => {
    setOpenCustomers(!openCustomers);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    router.push("/");
  };

  return (
    <div className="h-full w-64 bg-gray-50 dark:bg-gray-800">
      <div className="h-full px-3 py-4 overflow-y-auto">
        {/* Title at the top of the sidebar */}
        <div className="text-center py-4">
          <img
            src="/LogoLight.jpeg"
            alt="Logo"
            className="h-10 w-10 rounded-full mx-auto mb-2"
          />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Admin Panel
          </h2>
          {adminData && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome, {adminData.username}
            </p>
          )}
        </div>

        <ul className="space-y-2 font-medium">
          <li>
            <Link
              href="/store"
              onClick={onNavigate}
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaTachometerAlt className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ms-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/store/addCustomer"
              onClick={onNavigate}
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaShoppingCart className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="flex-1 ms-3 whitespace-nowrap">
                Add Customer
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/store/manageCustomer"
              onClick={onNavigate}
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaUserCircle className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="flex-1 ms-3 whitespace-nowrap">
                Manage Customer
              </span>
            </Link>
          </li>

          <li>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 w-full text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaSignOutAlt className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Logout
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
