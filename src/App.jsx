import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginForm from './components/LoginForm';
import TwoFactorAuth from './components/TwoFactorAuth';

// Создаем клиент React Query с настройками для моков
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, //повторять запросы 1 раз при ошибке
      refetchOnWindowFocus: false, //не обновлять при фокусе окна
      staleTime: 30000, //данные считаются свежими 30 секунд
    },
    mutations: {
      retry: 1, //повторять мутации 1 раз при ошибке
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [userEmail, setUserEmail] = useState('');

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setCurrentView('twoFactor');
  };

  const handleVerificationSuccess = (userData) => {
    alert(`Login successful`);
    setCurrentView('login');
    setUserEmail('');
    
    //инвалидируем кэш при успешном логине
    queryClient.invalidateQueries({ queryKey: ['2fa-code'] });
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setUserEmail('');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {currentView === 'login' && (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}
        
        {currentView === 'twoFactor' && (
          <TwoFactorAuth 
            email={userEmail}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBackToLogin}
          />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;