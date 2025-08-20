"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreAuthContext = createContext();

export const useStoreAuth = () => {
  const context = useContext(StoreAuthContext);
  if (!context) {
    throw new Error('useStoreAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on component mount
    const customerToken = localStorage.getItem('customerToken');
    const adminInfo = localStorage.getItem('customerInfo');
    
    // Also check for cookie
    const cookies = document.cookie.split(';');
    const customerTokenCookie = cookies.find(cookie => cookie.trim().startsWith('customerToken='));
    
    if ((customerToken && adminInfo) || customerTokenCookie) {
      setIsAuthenticated(true);
      if (adminInfo) {
        setAdminData(JSON.parse(adminInfo));
      }
    }
    setLoading(false);
  }, []);

  const login = (adminInfo, token) => {
    localStorage.setItem('customerToken', token);
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
    
    // Set cookie for server-side authentication
    document.cookie = `customerToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    
    setIsAuthenticated(true);
    setAdminData(adminInfo);
  };

  const logout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('adminInfo');
    
    // Remove cookie
    document.cookie = 'customerToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setIsAuthenticated(false);
    setAdminData(null);
  };

  const value = {
    isAuthenticated,
    adminData,
    loading,
    login,
    logout,
  };

  return (
    <StoreAuthContext.Provider value={value}>
      {children}
    </StoreAuthContext.Provider>
  );
};
