import { useMutation, useQuery } from '@tanstack/react-query';

//моковые функции API
export const authApi = {
  async login(credentials) {
    await new Promise(resolve => setTimeout(resolve, 1000)); //митация сетевой задержки в 1 секунду

    if (credentials.email === 'error@example.com') {
      throw new Error('server error');
    }

    if (credentials.email === 'validation@example.com') {
      const error = new Error('Validation failed');
      error.details = {
        email: ['Invalid email format'],
        password: ['Password must be at least 6 characters']
      };
      throw error;
    }

    if (credentials.email === 'network@example.com') {
      throw new Error('Network error');
    }

    return {
      success: true,
      requires2fa: true,
      message: 'Login successful'
    };
  },

  async send2FACode(email) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    return {
      success: true,
      code,
      expiresIn: 30
    };
  },

  async verify2FACode({ email, code }) {
    await new Promise(resolve => setTimeout(resolve, 600));

    if (code === '999999') throw new Error('2FA code expired');
    if (code === '000000') throw new Error('Invalid 2FA code');

    return {
      success: true,
      token: 'mock-jwt-token-12345',
      user: { id: '1', email: email, name: 'Shin' }
    };
  }
};

//кастомные хуки
export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

export const useSend2FACode = (email) => {
  return useQuery({
    queryKey: ['2fa-code', email],
    queryFn: () => authApi.send2FACode(email),
    enabled: false,
  });
};

export const useVerify2FA = () => {
  return useMutation({
    mutationFn: authApi.verify2FACode,
  });
};