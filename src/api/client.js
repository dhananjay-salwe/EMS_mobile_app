// OLD CODE:
// // const API_BASE_URL = 'http://192.168.1.7:8080/api';
// const API_BASE_URL = 'https://ems-backend-55q1.onrender.com/api';

// const API_BASE_URL = 'https://ems-api.spikedace.com/api';
const API_BASE_URL = 'https://ems-mobile-api.spikedace.com/api';

// FIX: Point mobile client to local backend API server on port 5000 for testing
// const API_BASE_URL = 'http://localhost:5000/api';

import AsyncStorage from '@react-native-async-storage/async-storage';

let authToken = null;

export const setAuthToken = async (token) => {
  authToken = token;
  try {
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  } catch (e) {
    console.error('Failed to persist auth token:', e);
  }
};

export const getAuthToken = async () => {
  if (authToken) return authToken;
  try {
    authToken = await AsyncStorage.getItem('auth_token');
    return authToken;
  } catch (e) {
    return null;
  }
};

export const apiCall = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  try {
    const headers = {};
    if (!isFormData && body !== null && body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (!authToken) {
      authToken = await AsyncStorage.getItem('auth_token');
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config = { method, headers };
    if (body !== null && body !== undefined) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Sending ${method} request to: ${fullUrl}`);

    const response = await fetch(fullUrl, config);

    // If the server responded with an HTTP error
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (_) {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (_) {}
      }
      console.error(`HTTP Status ${response.status} on [${endpoint}]:`, errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        status: response.status,
      };
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch Exception on [${endpoint}]:`, error);
    return { success: false, message: `Network exception: ${error.message}` };
  }
};

/**
 * Robust multipart upload using XMLHttpRequest to track accurate upload progress
 * and support 10-minute timeout for large video/image submissions.
 */
export const uploadWithProgress = async (endpoint, formData, onProgress) => {
  const token = await getAuthToken();
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`Sending XHR upload to: ${fullUrl}`);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', fullUrl);
    xhr.timeout = 600000; // 10 minutes timeout (600,000 ms)

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percentComplete = Math.min(100, Math.round((event.loaded / event.total) * 100));
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText || '{}');
      } catch (_) {
        data = { message: xhr.responseText || 'Non-JSON server response' };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          success: data.success !== undefined ? data.success : true,
          status: xhr.status,
          ...data,
        });
      } else {
        const errorMsg = data.message || data.error || `Upload failed with status ${xhr.status}`;
        console.error(`XHR Error Status ${xhr.status} on [${endpoint}]:`, errorMsg);
        resolve({
          success: false,
          status: xhr.status,
          message: errorMsg,
          ...data,
        });
      }
    };

    xhr.onerror = () => {
      console.error(`XHR Network Error on [${endpoint}]`);
      resolve({
        success: false,
        status: xhr.status || 0,
        message: 'Network error occurred during upload. Please verify your connection.',
      });
    };

    xhr.ontimeout = () => {
      console.error(`XHR Request Timeout (10 min) on [${endpoint}]`);
      resolve({
        success: false,
        status: 408,
        message: 'Upload timed out after 10 minutes. The server or network is too slow.',
      });
    };

    xhr.send(formData);
  });
};

/**
 * Updates officer profile (full name and optional compressed profile picture).
 * Uses multipart/form-data with exact field names 'full_name' and 'profile_picture'.
 */
export const updateProfile = async (fullName, imageUri = null) => {
  const formData = new FormData();
  formData.append('full_name', fullName.trim());

  if (imageUri) {
    formData.append('profile_picture', {
      uri: imageUri,
      name: `profile_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });
  }

  return await apiCall('/operators/profile', 'PUT', formData, true);
};

/**
 * Removes the officer profile picture.
 * Dispatches a DELETE request with Bearer authentication.
 */
export const removeProfilePicture = async () => {
  return await apiCall('/operators/profile/picture', 'DELETE');
};