import React, { useState } from 'react';
import { useLogin } from '../services/authApi';

const LoginForm = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const loginMutation = useLogin();

  const validate = (name, value) => {
    const newErrors = { ...errors };
    
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (name === 'email') {
      delete newErrors.email;
    }
    
    if (name === 'password' && value && value.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (name === 'password') {
      delete newErrors.password;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!Object.keys(errors).length && form.email && form.password) {
      loginMutation.mutate(form, {
        onSuccess: (data) => data.requires2fa && onLoginSuccess(form.email),
        onError: (error) => {
          error.details 
            ? setErrors(error.details)
            : alert(`API Error: ${error.message}`);
        }
      });
    }
  };

  const isFormValid = form.email && form.password && !Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow sm:rounded-lg">
          
          <div className="flex justify-center items-center space-x-3 mb-8">
            <img src="/Symbol.png" alt="Company Logo" className="w-6 h-6" />
            <div className="text-2xl font-bold text-gray-900">Company</div>
          </div>
          
          <h2 className="text-center text-lg font-medium text-gray-900 mb-8">
            Sign in to your account to continue
          </h2>

          {loginMutation.isError && !loginMutation.error?.details && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{loginMutation.error.message}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {['email', 'password'].map(field => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={field}
                  name={field}
                  type={field}
                  value={form[field]}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  className={`w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors[field] ? 'border-red-300' : 'border-gray-300'
                  } ${loginMutation.isPending ? 'bg-gray-100' : ''}`}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                />
                {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={!isFormValid || loginMutation.isPending}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isFormValid && !loginMutation.isPending
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;