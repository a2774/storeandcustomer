'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaSearch, FaSpinner, FaArrowLeft, FaEye, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedStoreRoute from '@/components/ProtectedStoreRoute';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const CustomersByStore = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;

  const fetchCustomers = async (id) => {
    if (!id) {
      toast.error('Invalid Store ID. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_STORE_URL}/GetCustomersByStoreId`, { params: { Id: id } });
      if (res.data && res.data.length > 0) {
        setCustomers(res.data);
        setStoreName(res.data[0].StoreName);
      } else {
        toast.info('No customers found for this store');
        setCustomers([]);
        setStoreName('Store');
      }
    } catch (err) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedid = localStorage.getItem('StoreID');
    if (storedid) {
      fetchCustomers(storedid);
    } else {
      setLoading(false);
      toast.error('Store ID not found. Please log in.');
    }
  }, []);

  const filtered = customers.filter((customer) => {
    const q = query.trim().toLowerCase();
    const customerDate = new Date(customer.Customer_Date);
    const matchesText =
      !q ||
      String(customer.Customer_Name || '').toLowerCase().includes(q) ||
      String(customer.Customer_Email || '').toLowerCase().includes(q) ||
      String(customer.Customer_phone || '').toLowerCase().includes(q) ||
      String(customer.service_name || '').toLowerCase().includes(q);
    const matchesDate = (!startDate || customerDate >= new Date(startDate)) && (!endDate || customerDate <= new Date(endDate + 'T23:59:59'));
    return matchesText && matchesDate;
  });

  const totalPages = Math.ceil(filtered.length / customersPerPage);
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filtered.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleView = (customerId) => {
    router.push(`/store/view/${customerId}`);
  };

  const handleDelete = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      setLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/DeleteCustomer`, null, { params: { id: customerId } });
      toast.success('Customer deleted successfully');
      setCustomers(customers.filter((c) => c.CustomerID !== customerId));
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const storedid = localStorage.getItem('StoreID');
    setQuery('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    fetchCustomers(storedid);
  };

  const handleAddCustomer = () => {
    router.push('/store/addCustomer');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Customers of ${storeName || 'Store'}`, 14, 10);
    const tableColumn = ['ID', 'Name', 'Email', 'Phone', 'Service', 'Product Amount', 'Date'];
    const tableRows = [];
    customers.forEach((customer) => {
      tableRows.push([
        customer.CustomerID,
        customer.Customer_Name,
        customer.Customer_Email,
        customer.Customer_phone,
        customer.service_name,
        customer.Customer_productamount,
        new Date(customer.Customer_Date).toLocaleString(),
      ]);
    });
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('customers.pdf');
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      customers.map((c) => ({
        ID: c.CustomerID,
        Name: c.Customer_Name,
        Email: c.Customer_Email,
        Phone: c.Customer_phone,
        Service: c.service_name,
        'Product Amount': c.Customer_productamount,
        Date: new Date(c.Customer_Date).toLocaleString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, 'customers.xlsx');
  };

  return (
    <ProtectedStoreRoute>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-2'>
        <button onClick={() => router.back()} className='flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-4'>
          <FaArrowLeft />
          Back
        </button>
        <div className='max-w-6xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
              Customers of {storeName || 'Store'}
            </h1>
            <p className='text-gray-600 mt-2 text-lg'>Manage and view all registered customers of this store</p>
          </div>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6'>
            <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>
              <div className='relative flex-1'>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder='Search by name, email, phone, or service...'
                  className='w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
                <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              </div>
              <div className='flex gap-2 items-center'>
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
                <span className='text-gray-500'>to</span>
                <input
                  type='date'
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className='bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-sm'>
                  <FaSpinner className={`${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button onClick={handleAddCustomer} className='bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-sm'>
                  Add
                </button>
                <button onClick={handleDownloadPDF} className='bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-sm'>
                  <FaFilePdf className='text-base' />
                  PDF
                </button>
                <button onClick={handleDownloadExcel} className='bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-sm'>
                  <FaFileExcel className='text-base' />
                  Excel
                </button>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4'>
              <h2 className='text-xl font-semibold text-white flex items-center'>
                <FaUsers className='mr-3' />
                Customer List
              </h2>
            </div>
            <div className='p-6'>
              {loading ? (
                <div className='flex items-center justify-center py-12'>
                  <FaSpinner className='animate-spin text-4xl text-indigo-500' />
                </div>
              ) : (
                <>
                  <div className='overflow-x-auto'>
                    <table className='w-full border-collapse'>
                      <thead>
                        <tr className='text-left text-xs uppercase tracking-wide text-gray-600'>
                          <th className='p-3 bg-gray-50'>ID</th>
                          <th className='p-3 bg-gray-50'>Name</th>
                          <th className='p-3 bg-gray-50'>Email</th>
                          <th className='p-3 bg-gray-50'>Phone</th>
                          <th className='p-3 bg-gray-50'>Service</th>
                          <th className='p-3 bg-gray-50'>Product Amount</th>
                          <th className='p-3 bg-gray-50'>Date</th>
                          <th className='p-3 bg-gray-50 text-center'>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCustomers.length > 0 ? (
                          currentCustomers.map((customer) => (
                            <tr key={customer.CustomerID} className='hover:bg-gray-50 text-sm border-t'>
                              <td className='p-3'>{customer.CustomerID}</td>
                              <td className='p-3'>{customer.Customer_Name}</td>
                              <td className='p-3'>{customer.Customer_Email}</td>
                              <td className='p-3'>{customer.Customer_phone}</td>
                              <td className='p-3'>{customer.service_name}</td>
                              <td className='p-3'>{customer.Customer_productamount}</td>
                              <td className='p-3'>
                                {new Date(customer.Customer_Date).toLocaleString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true,
                                })}
                              </td>
                              <td className='p-3 text-center flex justify-center gap-2'>
                                <button
                                  onClick={() => handleView(customer.CustomerID)}
                                  className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-1'>
                                  <FaEye /> View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className='p-8 text-center text-gray-500 border-t'>
                              <div className='flex flex-col items-center gap-2'>
                                <FaUsers className='text-4xl text-gray-300' />
                                <p>No customers found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className='flex justify-center items-center gap-2 mt-6 flex-wrap'>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className='px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100'>
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          className={`px-3 py-1 border rounded-lg ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className='px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100'>
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
};

export default CustomersByStore;
