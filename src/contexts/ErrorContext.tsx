import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ErrorModal } from '../components/ErrorModal';

interface ErrorContextType {
  showError: (message: string) => void;
  hideError: () => void;
  isErrorVisible: boolean;
  errorMessage: string;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setIsErrorVisible(true);
  }, []);

  const hideError = useCallback(() => {
    setIsErrorVisible(false);
    // Clear message after animation completes
    setTimeout(() => {
      setErrorMessage('');
    }, 200);
  }, []);

  return (
    <ErrorContext.Provider
      value={{
        showError,
        hideError,
        isErrorVisible,
        errorMessage,
      }}
    >
      {children}
      <ErrorModal
        visible={isErrorVisible}
        message={errorMessage}
        onDismiss={hideError}
      />
    </ErrorContext.Provider>
  );
};