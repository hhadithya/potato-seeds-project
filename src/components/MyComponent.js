import React, { useEffect, useState } from 'react';
import '../stylesheets/print.css';

const MyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('your-api-endpoint')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="sidebar">
        <h2>Sidebar</h2>
        <p>Some sidebar content</p>
        {/* Add more sidebar content as needed */}
      </div>
      <div className="content">
        <div className="printableArea">
          {data ? (
            <div>
              <h1>Passbook</h1>
              <p>Account Holder: John Doe</p>
              <p>Account Number: 123456789</p>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2023-01-01</td>
                    <td>Deposit</td>
                    <td>$1000</td>
                    <td>$1000</td>
                  </tr>
                  <tr>
                    <td>2023-01-05</td>
                    <td>Withdrawal</td>
                    <td>$200</td>
                    <td>$800</td>
                  </tr>
                  <tr>
                    <td>2023-01-10</td>
                    <td>Deposit</td>
                    <td>$500</td>
                    <td>$1300</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p>Working</p>
          )}
        </div>
        <button onClick={handlePrint}>Print</button>
      </div>
    </div>
  );
};

export default MyComponent;