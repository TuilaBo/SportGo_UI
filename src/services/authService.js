const API_BASE_URL = '/api';

// Test function to debug API connection
export const testLoginAPI = async () => {
  try {
    console.log('Testing API connection...');
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpassword",
        deviceId: "test-device",
        deviceName: "Test Browser"
      })
    });

    console.log('Test response status:', response.status);
    console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Test response body:', responseText);
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    };
  } catch (error) {
    console.error('Test API error:', error);
    throw error;
  }
};

// Login user function
export const loginUser = async (loginData) => {
  try {
    console.log('Sending login request:', {
      email: loginData.email,
      password: loginData.password,
      deviceId: loginData.deviceId || 'web-device',
      deviceName: loginData.deviceName || 'Web Browser'
    });

    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password,
        deviceId: loginData.deviceId || 'web-device',
        deviceName: loginData.deviceName || 'Web Browser'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.log('Could not parse error response:', parseError);
        errorMessage = 'Có lỗi xảy ra với máy chủ';
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Login success:', result);
    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register user function
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        isProvider: userData.isProvider || false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Get current user info function
export const getUserInfo = async (accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/me`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
};

// Forgot password function
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/forgot-password`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

// Reset password function
export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/reset-password`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

// Submit provider profile function
export const submitProviderProfile = async (providerData, accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Provider/submit-profile`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName: providerData.businessName,
        address: providerData.address,
        businessPhoneNumber: providerData.businessPhoneNumber,
        businessLicenseUrl: providerData.businessLicenseUrl,
        bankAccountName: providerData.bankAccountName,
        bankAccountNumber: providerData.bankAccountNumber,
        bankName: providerData.bankName
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Submit provider profile error:', error);
    throw error;
  }
};

// Verify email function
export const verifyEmail = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/verify-email`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        otp: otp
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

// Logout user function
export const logoutUser = async (refreshToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/logout`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let message = `HTTP error! status: ${response.status}`;
      try {
        const data = JSON.parse(errorText || '{}');
        message = data.message || data.error || message;
      } catch {}
      throw new Error(message);
    }

    // Some APIs return empty body on logout
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
