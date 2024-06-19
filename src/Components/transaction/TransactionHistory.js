import React, { useEffect, useState, useContext } from 'react';
import { TransactionContext } from '../context/TransactionContext';

const TransactionHistory = () => {
  const { setDescriptions, setAmounts } = useContext(TransactionContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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
        const descriptions = result.data.records.map(record => record.description);
        console.log(descriptions)
        const amounts = result.data.records.map(record => record.amount);
        console.log(amounts)
        setDescriptions(descriptions);
        setAmounts(amounts)
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, [setDescriptions, setAmounts]);

  return null;
};

export default TransactionHistory;