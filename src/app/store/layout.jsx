"use client";
import React from "react";
import Sidebar from "./Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import ProtectedStoreRoute from "@/components/ProtectedStoreRoute";
import { useStoreAuth } from "@/context/StoreAuthContext";


export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { logout } = useStoreAuth();
  const router = useRouter();

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
    router.push('/');
  };

  return (
    <ProtectedStoreRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile Sidebar + Overlay */}
        <div className={`fixed inset-0 z-40 md:hidden ${isSidebarOpen ? "" : "pointer-events-none"}`}>
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside
            className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
          </aside>
        </div>

        {/* Desktop Sidebar - Fixed Position */}
        <aside className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30">
          <Sidebar />
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-64">
          {/* Top Bar */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center justify-between shadow-sm">
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <img src="/LogoLight.jpeg" alt="Logo" className="h-8 w-8 rounded-full" />
              <span className="font-semibold text-gray-800 hidden sm:inline">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer />
    </ProtectedStoreRoute>
  );
}
