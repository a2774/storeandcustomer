'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCreditCard,
  FaMoneyBillWave,
  FaCogs,
  FaFileAlt,
  FaUpload,
  FaSpinner,
  FaArrowLeft,
  FaInfoCircle
} from 'react-icons/fa';

const NEXT_PUBLIC_UPLOAD_URL = process.env.NEXT_PUBLIC_STORE_URL
  ? `${process.env.NEXT_PUBLIC_STORE_URL}/PostUserImage`
  : 'http://122.160.25.202/micron/app/api/api/store/PostUserImage';
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
  'http://122.160.25.202/micron/app/api/api/CustomerDetails';

export default function CustomerForm() {
  const navigate = useRouter();
  const [product, setProduct] = useState([]);
  const [panFile, setPanFile] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [uploadingPan, setUploadingPan] = useState(false);
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    Customer_AadharNumber: '',
    Customer_PanNumber: '',
    Customer_ProductAmount: '',
    Productservices_Id: '',
    customer_aadhar: '',
    customer_pancard: '',
  });

  // I've removed the local previews state since it's not being used in the final design.
  // The 'uploaded' check on file names is sufficient.

  const validateField = (name, value) => {
    if (!value || String(value).trim() === '') {
      return 'This field is required.';
    }
    switch (name) {
      case 'customer_name':
        if (!/^[A-Za-z\s]{3,50}$/.test(value)) return 'Name must be 3-50 letters and spaces.';
        break;
      case 'customer_email':
        if (!/^[\w-.]+@([\w-]+\.)+[A-Za-z]{2,}$/.test(value)) return 'Enter a valid email address.';
        break;
      case 'customer_phone':
        if (!/^[6-9]\d{9}$/.test(value)) return 'Phone must be 10 digits starting with 6-9.';
        break;
      case 'Customer_AadharNumber':
        if (!/^\d{12}$/.test(value)) return 'Aadhar must be exactly 12 digits.';
        break;
      case 'Customer_PanNumber':
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return 'Enter valid PAN (e.g., ABCDE1234F).';
        break;
      case 'Customer_ProductAmount':
        if (value <= 0 || !/^\d{1,7}(\.\d{1,2})?$/.test(value))
          return 'Amount must be valid (max 7 digits, 2 decimals) and greater than zero.';
        break;
      case 'Productservices_Id':
        if (!value) return 'Please select a service.';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "customer_name") {
      newValue = newValue.slice(0, 50);
    }
    if (name === "customer_email") {
      newValue = newValue.slice(0, 30);
    }
    if (name === "customer_phone") {
      newValue = newValue.replace(/\D/g, "").slice(0, 10);
    }
    if (name === "Customer_AadharNumber") {
      newValue = newValue.replace(/\D/g, "").slice(0, 12);
    }
    if (name === "Customer_PanNumber") {
      newValue = newValue.toUpperCase().slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    const errorMsg = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleFileUploadChange = async (e, type) => {
    const file = e.target.files[0];
    const fieldName = type === 'Pan' ? 'customer_pancard' : 'customer_aadhar';
    if (!file) {
      setErrors((prev) => ({ ...prev, [fieldName]: 'File is required.' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, GIF allowed.');
      setErrors((prev) => ({ ...prev, [fieldName]: 'Invalid file type.' }));
      e.target.value = ''; // Clear file input
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File too large. Max size 1MB.');
      setErrors((prev) => ({ ...prev, [fieldName]: 'File too large.' }));
      e.target.value = '';
      return;
    }

    const setFile = type === 'Pan' ? setPanFile : setAadharFile;
    const setUploading = type === 'Pan' ? setUploadingPan : setUploadingAadhar;

    setUploading(true);
    const formPayload = new FormData();
    formPayload.append('file', file);
    formPayload.append('uploadtype', type);

    try {
      const res = await axios.post(NEXT_PUBLIC_UPLOAD_URL, formPayload);
      if (res.data?.success && res.data?.fileName) {
        setFile(res.data.fileName);
        setFormData((prev) => ({
          ...prev,
          [fieldName]: res.data.fileName,
        }));
        toast.success(`${type} uploaded successfully!`);
        setErrors((prev) => ({ ...prev, [fieldName]: '' }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: res.data?.error || 'Upload failed.',
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: err?.response?.data?.error || err.message || 'Upload failed.',
      }));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchProductServices = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/GetProductService`);
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      }
    };
    fetchProductServices();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    if (!panFile) newErrors.customer_pancard = 'PAN card image is required';
    if (!aadharFile) newErrors.customer_aadhar = 'Aadhar card image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error('Please fix validation errors before submitting.');
    return;
  }

  if (uploadingPan || uploadingAadhar) {
    toast.warn('Please wait for files to finish uploading.');
    return;
  }

  const currentLogin = JSON.parse(localStorage.getItem('CurrentLogin'));
  if (!currentLogin) {
    toast.error('No current login found!');
    return;
  }
  const { EmployeeID, StoreID } = currentLogin;

  const payload = {
    ...formData,
    customer_aadhar: aadharFile,
    customer_pancard: panFile,
    StoreID,
  };

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/CreateCustomer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === 1) {
      // ✅ success
      toast.success(result.message);
      const key = `customerData_${EmployeeID}_${StoreID}`;
      const prevCustomers = JSON.parse(localStorage.getItem(key)) || [];
      prevCustomers.push({ ...payload, time: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prevCustomers));
      navigate.push('/store/manageCustomer');
    } else {
      // ❌ duplicate error -> show under input field
      const duplicateMsg = result.message || "Duplicate value";

      if (duplicateMsg.includes("Email")) {
        setErrors(prev => ({ ...prev, customer_email: duplicateMsg }));
      } else if (duplicateMsg.includes("Phone")) {
        setErrors(prev => ({ ...prev, customer_phone: duplicateMsg }));
      } else if (duplicateMsg.includes("Aadhar")) {
        setErrors(prev => ({ ...prev, Customer_AadharNumber: duplicateMsg }));
      } else if (duplicateMsg.includes("PAN")) {
        setErrors(prev => ({ ...prev, Customer_PanNumber: duplicateMsg }));
      } else {
        toast.error(duplicateMsg); // fallback
      }
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error('Failed to add customer. Try again.');
  }
};


  const isUploading = uploadingPan || uploadingAadhar;
  const isFormInvalid = Object.values(errors).some(error => error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-2">
      <button
        onClick={() => navigate.back()}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        <FaArrowLeft />
        Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Add New Customer
          </h1>
          <p className="text-gray-500 mt-1">
            Enter the customer's details and required documents.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mx-auto">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FaUser className="mr-3" />
              Customer Information
            </h2>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Dropdown */}
              <div>
                <label
                  htmlFor="services"
                  className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
                >
                  <FaCogs className="mr-2 text-indigo-500" />
                  Service *
                </label>
                <select
                  id="services"
                  name="Productservices_Id"
                  value={formData.Productservices_Id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.Productservices_Id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a Service</option>
                  {product.map((service) => (
                    <option key={service.Productservices_Id} value={service.Productservices_Id}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
                {errors.Productservices_Id && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <FaInfoCircle className="mr-1" />
                    {errors.Productservices_Id}
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Customer Name', name: 'customer_name', type: 'text', icon: FaUser, placeholder: 'Enter Customer Name' },
                  { label: 'Email Address', name: 'customer_email', type: 'email', icon: FaEnvelope, placeholder: 'Enter Email Address' },
                  { label: 'Phone Number', name: 'customer_phone', type: 'tel', icon: FaPhone, placeholder: 'Enter Phone Number' },
                  { label: 'Product Amount', name: 'Customer_ProductAmount', type: 'number', icon: FaMoneyBillWave, placeholder: 'Enter Amount' },
                  { label: 'Aadhar Number', name: 'Customer_AadharNumber', type: 'text', icon: FaCreditCard, placeholder: '1234 5678 9012' },
                  { label: 'PAN Number', name: 'Customer_PanNumber', type: 'text', icon: FaIdCard, placeholder: 'ABCDE1234F' },
                ].map(({ label, name, type, icon: Icon, placeholder }) => (
                  <div key={name}>
                    <label
                      htmlFor={name}
                      className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
                    >
                      <Icon className="mr-2 text-indigo-500" />
                      {label} *
                    </label>
                    <input
                      type={type}
                      name={name}
                      id={name}
                      value={formData[name]}
                      onChange={handleChange}
                      onBlur={() => setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }))}
                      placeholder={placeholder}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors[name] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors[name] && (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <FaInfoCircle className="mr-1" />
                        {errors[name]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Aadhar Card Image', type: 'Aadhar', name: 'customer_aadhar', fileName: aadharFile, uploading: uploadingAadhar },
                  { label: 'PAN Card Image', type: 'Pan', name: 'customer_pancard', fileName: panFile, uploading: uploadingPan },
                ].map(({ label, type, name, fileName, uploading }) => (
                  <div key={name}>
                    <label
                      htmlFor={name}
                      className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
                    >
                      <FaFileAlt className="mr-2 text-indigo-500" />
                      {label} *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUploadChange(e, type)}
                        className="hidden"
                        id={name}
                      />
                      <label
                        htmlFor={name}
                        className={`w-full px-4 py-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-center ${
                          errors[name]
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                        }`}
                      >
                        {uploading ? (
                          <FaSpinner className="animate-spin mr-2 text-indigo-500" />
                        ) : (
                          <FaUpload className="mr-2 text-indigo-500" />
                        )}
                        {fileName ? `${label} Uploaded ✓` : `Upload ${label}`}
                      </label>
                    </div>
                    {errors[name] && (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <FaInfoCircle className="mr-1" />
                        {errors[name]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isUploading || isFormInvalid}
                  className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white transition-all duration-200 ${
                    isUploading || isFormInvalid
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="animate-spin mr-3" />
                      Uploading Files...
                    </>
                  ) : (
                    <>
                      <FaUser className="mr-3" />
                      Add Customer
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
  );
}