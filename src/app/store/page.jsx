import React from 'react';
import ProtectedStoreRoute from '@/components/ProtectedStoreRoute';

const CustomerDashboard = () => {
  return (
    <ProtectedStoreRoute>
      <div>CustomerDashboard</div>
    </ProtectedStoreRoute>
  );
};

export default CustomerDashboard;