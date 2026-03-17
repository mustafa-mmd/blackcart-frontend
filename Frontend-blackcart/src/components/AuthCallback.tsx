import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  emailVerified: boolean;
  authMethod: string;
}

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGoogleCallback = () => {
      // Get the hash from URL (everything after #)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      const token = params.get('token');
      const userJson = params.get('user');
      
      if (token && userJson) {
        try {
          const userData: UserData = JSON.parse(userJson);
          
          // 1. Save to localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // 2. If using Redux, dispatch action
          if (dispatch) {
            dispatch(setCredentials({ 
              user: userData, 
              token 
            }));
          }
          
          // 3. Show success message
          toast.success(`Welcome ${userData.name}!`);
          
          // 4. Redirect to home/dashboard
          setTimeout(() => {
            navigate('/');
          }, 1500);
          
        } catch (error) {
          console.error('Error processing auth callback:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
        }
      } else {
        // Check for error in URL parameters
        const error = params.get('error');
        const errorMessage = params.get('message');
        
        if (error) {
          toast.error(`Authentication error: ${errorMessage || error}`);
        } else {
          toast.error('No authentication data received');
        }
        
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Completing Authentication
        </h2>
        <p className="text-gray-500">
          Please wait while we log you in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;