import React, { createContext, useState } from 'react';

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [descriptions, setDescriptions] = useState([]);
  const [times, setTimes] = useState([]);
  const [amounts, setAmount] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_CASSO_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Apikey ${process.env.REACT_APP_CASSO_API_KEY}`,
        },
      });
   
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      const newDescriptions = result.data.records.map(record => record.description);
      const newTimes = result.data.records.map(record => record.when);
      const newAmounts = result.data.records.map(record => record.amount);
      setDescriptions(newDescriptions);
      setTimes(newTimes);
      setAmount(newAmounts);
  
      return { descriptions: newDescriptions, times: newTimes, amounts:  newAmounts};
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return { descriptions: [], times: [], amounts: [] }; // Ensure an object containing descriptions and times is returned
    }
  };

  return (
    <TransactionContext.Provider value={{ descriptions, times, amounts, fetchTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};