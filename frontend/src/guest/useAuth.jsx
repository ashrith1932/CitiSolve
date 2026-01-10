// hooks/useAuth.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // ============================================
  // 1. SIGNUP
  // ============================================
  const signup = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setUserEmail(data.email);
        setOtpSent(true);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 2. LOGIN
  // ============================================
  const login = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setUserEmail(data.email);
        setOtpSent(true);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 3. VERIFY OTP
  // ============================================
  const verifyOTP = async (otp, role) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.ok) {
        // Navigate based on role
        if (role === 'citizen') {
          navigate('/citizen/home');
        } else if (role === 'staff') {
          navigate('/staff/home');
        } else if (role === 'admin') {
          navigate('/admin/home');
        }
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 4. RESEND OTP
  // ============================================
  const resendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 5. LOGOUT
  // ============================================
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ============================================
  // 6. CHECK AUTH STATUS
  // ============================================
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  return {
    signup,
    login,
    verifyOTP,
    resendOTP,
    logout,
    checkAuth,
    loading,
    error,
    otpSent,
    userEmail,
    setError,
  };
};