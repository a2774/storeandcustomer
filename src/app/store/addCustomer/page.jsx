'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const NEXT_PUBLIC_UPLOAD_URL = 'http://122.160.25.202/micron/app/api/api/store/PostUserImage';
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

  const [previews, setPreviews] = useState({
    customer_aadhar: null,
    customer_pancard: null,
  });

  // ✅ Field-wise validation
  const validateField = (name, value) => {
    if (!value || value.trim() === '') {
      return 'This field is required.';
    }
    switch (name) {
      case 'customer_name':
        if (!/^[A-Za-z ]{3,50}$/.test(value)) return 'Name must be 3-50 letters only.';
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
        if (!/^\d{1,7}(\.\d{1,2})?$/.test(value))
          return 'Amount must be valid (max 7 digits, 2 decimals).';
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

    // ✅ Apply hard input limits
     if (name === "customer_name") {
    newValue = newValue.slice(0, 50); // max 50 characters
  }
  if (name === "customer_email") {
    newValue = newValue.slice(0, 30); // max 100 characters
  }
  if (name === "customer_phone") {
    newValue = newValue.replace(/\D/g, "").slice(0, 10); // only 10 digits
  }
  if (name === "Customer_AadharNumber") {
    newValue = newValue.replace(/\D/g, "").slice(0, 12); // 12 digits only
  }
  if (name === "Customer_PanNumber") {
    newValue = newValue.toUpperCase().slice(0, 10); // PAN = 10 chars only
  }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    const errorMsg = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // ✅ File Upload Handler
  const handleFileUploadChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, GIF allowed.');
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File too large. Max size 1MB.');
      return;
    }

    const setFile = type === 'Pan' ? setPanFile : setAadharFile;
    const setUploading = type === 'Pan' ? setUploadingPan : setUploadingAadhar;
    const fieldName = type === 'Pan' ? 'customer_pancard' : 'customer_aadhar';

    setPreviews((prev) => ({
      ...prev,
      [fieldName]: URL.createObjectURL(file),
    }));

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

  // ✅ Full form validation (on submit)
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    if (!panFile) newErrors.customer_pancard = 'PAN image required';
    if (!aadharFile) newErrors.customer_aadhar = 'Aadhar image required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting.');
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
      if (!response.ok) throw new Error('Failed to submit form');
      await response.json();

      toast.success('Customer added successfully!');
      const key = `customerData_${EmployeeID}_${StoreID}`;
      const prevCustomers = JSON.parse(localStorage.getItem(key)) || [];
      prevCustomers.push({ ...payload, time: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prevCustomers));
      navigate.push('/store/manageCustomer');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to add customer. Try again.');
    }
  };

  const isUploading = uploadingPan || uploadingAadhar;

  return (
    <>
      <h1 className="max-w-5xl mx-auto w-full h-24 bg-blue-600 text-white font-extrabold text-4xl flex items-center justify-center rounded-xl mt-12 mb-6">
        Fill All Details
      </h1>

      <form
        className="max-w-5xl mx-auto p-10 bg-white rounded-xl shadow-xl border border-gray-200"
        onSubmit={handleSubmit}
      >
        {/* Service Dropdown */}
        <div className="flex flex-col mb-6">
          <label htmlFor="services" className="text-sm font-medium text-gray-700 mb-2">
            Services
          </label>
          <select
            id="services"
            name="Productservices_Id"
            value={formData.Productservices_Id}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a Service --</option>
            {product.map((service) => (
              <option key={service.Productservices_Id} value={service.Productservices_Id}>
                {service.service_name}
              </option>
            ))}
          </select>
          {errors.Productservices_Id && (
            <p className="text-red-500 text-sm mt-1">{errors.Productservices_Id}</p>
          )}
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
          {[
            { label: 'Customer Name', name: 'customer_name', type: 'text', placeholder: 'Enter Customer Name', maxLength: 50 },
            { label: 'Customer Email', name: 'customer_email', type: 'email', placeholder: 'Enter Customer Email', maxLength: 30 },
            { label: 'Customer Phone', name: 'customer_phone', type: 'tel', placeholder: 'Enter Customer Phone', maxLength: 10 },
            { label: 'Customer Aadhar Number', name: 'Customer_AadharNumber', type: 'text', placeholder: 'Enter Aadhar Number', maxLength: 12 },
            { label: 'Customer PAN Number', name: 'Customer_PanNumber', type: 'text', placeholder: 'Enter PAN Number', maxLength: 10 },
            { label: 'Customer Product Amount', name: 'Customer_ProductAmount', type: 'number', placeholder: 'Enter Amount', min: 0, step: 'any', maxLength: 9 },
          ].map(({ label, name, type, placeholder, min, step, maxLength }) => (
            <div key={name}>
              <label className="mb-3 text-base font-semibold text-slate-900 block">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-[#f0f1f2] focus:bg-white text-black text-base border border-gray-300 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={min}
                step={step}
                maxLength={maxLength}
              />
              {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
            </div>
          ))}

          {/* File Uploads */}
          {[
            { label: 'Upload Aadhar', type: 'Aadhar', name: 'customer_aadhar', preview: previews.customer_aadhar, error: errors.customer_aadhar, uploading: uploadingAadhar },
            { label: 'Upload PAN Card', type: 'Pan', name: 'customer_pancard', preview: previews.customer_pancard, error: errors.customer_pancard, uploading: uploadingPan },
          ].map(({ label, type, name, preview, error, uploading }) => (
            <div key={name} className="flex flex-col items-start">
              <label className="mb-2 text-base font-semibold text-slate-900">{label}</label>
              <input
                type="file"
                name={name}
                accept="image/*"
                onChange={(e) => handleFileUploadChange(e, type)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 cursor-pointer hover:border-blue-500 transition"
              />
              {uploading && <p className="text-blue-500 mt-1">Uploading...</p>}
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              {preview && (
                <img
                  src={preview}
                  alt={`${name} preview`}
                  className="mt-2 w-48 h-32 object-contain border rounded-md shadow-sm"
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className={`mt-12 px-8 py-3 text-lg font-semibold w-full max-w-[160px] mx-auto block bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading files...' : 'Submit'}
        </button>
      </form>
    </>
  );
}