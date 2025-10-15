import React, { useState, useEffect } from 'react';
import { useSend2FACode, useVerify2FA } from '../services/authApi';

const TwoFactorAuth = ({ email, onVerificationSuccess, onBack }) => {
  const [code, setCode] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  const { data: codeData, refetch: sendCode, isLoading: isSending } = useSend2FACode(email);
  const verify = useVerify2FA();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && codeData) {
      sendNewCode();
    }
  }, [timer, codeData]);

  useEffect(() => { sendNewCode(); }, []);

  const sendNewCode = () => {
    sendCode().then(({ data }) => {
      data && setTimer(data.expiresIn);
      setCode(Array(6).fill(''));
      setError('');
    });
  };

  const handleCode = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setError('');

      value && index < 5 && document.getElementById(`code-${index + 1}`).focus();
      newCode.every(d => d) && handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handleVerify = (submittedCode = code.join('')) => {
    if (submittedCode.length === 6) {
      verify.mutate({ email, code: submittedCode }, {
        onSuccess: onVerificationSuccess,
        onError: (err) => {
          setError(err.message);
          err.message === '2FA code expired' && setTimeout(sendNewCode, 1000);
        }
      });
    }
  };

  const isComplete = code.every(d => d);
  const isExpired = timer === 0;
  const isDisabled = verify.isPending || isExpired || isSending;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow sm:rounded-lg">
          
          <div className="flex justify-center items-center space-x-3 mb-8">
            <img src="/Symbol.png" alt="Logo" className="w-6 h-6" />
            <div className="text-2xl font-bold text-gray-900">Company</div>
          </div>
          
          <h1 className="text-center text-xl font-bold text-gray-900 mb-2">
            Two-Factor Authentication
          </h1>
          
          <p className="text-center text-gray-600 mb-4">
            Enter the 6-digit code sent to your email
          </p>
          
          <p className="text-center text-sm text-blue-600 mb-4">{email}</p>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Code expires in: <span className={`font-bold ${timer < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                {timer}s
              </span>
            </p>
            {isExpired && !isSending && <p className="text-red-500 text-sm mt-1">Sending new code...</p>}
            {isSending && <p className="text-blue-500 text-sm mt-1">Sending code...</p>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-6">
            <div className="flex justify-center space-x-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCode(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isDisabled}
                  className={`w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-300' : 'border-gray-300'
                  } ${isDisabled ? 'bg-gray-100' : ''}`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {codeData && (
              <div className="text-center text-xs text-gray-500 bg-gray-100 p-2 rounded">
                Test: <strong>{codeData.code}</strong> (success) or <strong>000000</strong> (error)
              </div>
            )}

            <button
              type="submit"
              disabled={!isComplete || isDisabled}
              className={`w-full py-2 px-4 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isComplete && !isDisabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {verify.isPending ? 'Verifying...' : 'Continue'}
            </button>
          </form>

          <div className="text-center mt-4 space-y-2">
            <button
              onClick={sendNewCode}
              disabled={timer > 0 || isSending}
              className={`text-sm w-full ${
                !timer && !isSending ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'
              }`}
            >
              {isSending ? 'Sending...' : `Resend code ${timer > 0 ? `(${timer}s)` : ''}`}
            </button>
            
            <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-800">
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;