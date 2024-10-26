import React from 'react';

const FarmerTable = (data) => {
    data = data.data;
    
  return (
    <div className="overflow-x-auto flex justify-center">
      <table className="table-auto border-collapse border border-gray-300 w-10/12 text-left">
        <thead className="bg-emerald-50 text-base text-gray-800">
          <tr style={{borderRadius: '50px'}}>
            <th className="border border-gray-300 p-2 font-medium">Farmer ID</th>
            <th className="border border-gray-300 p-2 font-medium">Date</th>
            <th className="border border-gray-300 p-2 font-medium">Time</th>
            <th className="border border-gray-300 p-2 font-medium">Weight</th>
          </tr>
        </thead>
        <tbody className="text-sm font-normal">
        {data.map((item, index) => (
          <tr key={index}>
            <td className="border border-gray-300 p-2">{item.farmerId}</td>
            <td className="border border-gray-300 p-2">{item.date}</td>
            <td className="border border-gray-300 p-2">{item.time}</td>
            <td className="border border-gray-300 p-2">{item.weight} kg</td>
          </tr>
        ))}
          <tr>
            <td className="border border-gray-300 p-2 font-medium" colSpan="3">Total</td>
            <td className="border border-gray-300 p-2 font-medium"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FarmerTable;
