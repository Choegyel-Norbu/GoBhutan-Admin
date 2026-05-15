import { createContext, useCallback, useContext, useState } from 'react';
import { api } from '@/lib/apiService';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCurrency, setWalletCurrency] = useState('BTN');
  const [walletStatus, setWalletStatus] = useState('');
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState('');

  const refreshWalletBalance = useCallback(async () => {
    setIsWalletLoading(true);
    setWalletError('');

    try {
      const response = await api.wallet.getBalance();
      if (!response?.success || !response?.data) {
        throw new Error(response?.message || 'Failed to fetch wallet balance.');
      }

      const fetchedBalance = Number(response.data.balance);
      setWalletBalance(Number.isNaN(fetchedBalance) ? 0 : fetchedBalance);
      setWalletCurrency(response.data.currency || 'BTN');
      setWalletStatus(response.data.status || '');
    } catch (error) {
      setWalletError(error?.message || 'Failed to fetch wallet balance.');
      console.error('Error fetching wallet balance:', error);
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  const updateBalance = (newBalance) => {
    setWalletBalance(newBalance);
  };

  const adjustBalance = (amount, type) => {
    if (type === 'Credit') {
      setWalletBalance(prev => prev + amount);
    } else {
      setWalletBalance(prev => Math.max(0, prev - amount));
    }
  };

  const value = {
    walletBalance,
    walletCurrency,
    walletStatus,
    isWalletLoading,
    walletError,
    refreshWalletBalance,
    updateBalance,
    adjustBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

