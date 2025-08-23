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
        return { status: 0, message: 'Invalid Store ID or Password' };
      } else if (res.status === 500) {
        return { status: 0, message: 'Server error. Please try again later.' };
      } else {
        return { status: 0, message: 'Something went wrong! Please try again.' };
      }
    }

    return await res.json();
  } catch {
    // ❌ console.error hata diya
    // return { status: 0, message: 'Network error. Please try again later.' };
  }
}
