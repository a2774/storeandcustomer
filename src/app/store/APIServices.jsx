// src/services/APIServices.js
export const baseurl = 'http://122.160.25.202/micron/app/api/api/Customer';

export async function customerLogin(customerdata) {
  try {
    const res = await fetch(`${baseurl}/CustomerLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerdata),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Invalid Store ID or Password');
      } else if (res.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Something went wrong! Please try again.');
      }
    }

    return await res.json();
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}