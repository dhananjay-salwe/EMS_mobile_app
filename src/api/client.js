// OLD CODE:
// // const API_BASE_URL = 'http://192.168.1.7:8080/api';
const API_BASE_URL = 'https://ems-backend-55q1.onrender.com/api';

// FIX: Point mobile client to local backend API server on port 5000 for testing
// const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  try {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const config = { method, headers };
    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Sending ${method} request to: ${fullUrl}`);

    const response = await fetch(fullUrl, config);

    // If the server responded with an HTTP error (500, 502, 404)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Status ${response.status} on [${endpoint}]:`, errorText);
      return { 
        success: false, 
        message: `Server returned HTTP ${response.status}. Check Render logs.` 
      };
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch Exception on [${endpoint}]:`, error);
    return { success: false, message: `Network exception: ${error.message}` };
  }
};