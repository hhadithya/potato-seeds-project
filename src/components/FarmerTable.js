import React, { useState } from 'react';

const FarmerTable = ({ data }) => {
    // Calculate total weight
    let totalWeight = 0;
    data.forEach((item) => {
      totalWeight += item.value;
    });

    // Pagination logic
    const rowsPerPage = 10; // Rows per page
    const [currentPage, setCurrentPage] = useState(1); // Current page state

    const totalPages = Math.ceil(data.length / rowsPerPage); // Total pages
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow); // Data for current page

    // Handlers for next and previous page
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
      <div className="overflow-x-auto flex flex-col justify-center items-center">
        <table className="table-auto border-collapse border border-gray-300 w-4/5 text-left">
          <thead className="bg-orange-50 text-base text-gray-800">
            <tr style={{borderRadius: '50px'}}>
              <th className="border border-gray-300 p-2 font-medium">Farmer ID</th>
              <th className="border border-gray-300 p-2 font-medium">Time</th>
              <th className="border border-gray-300 p-2 font-medium">Weight</th>
            </tr>
          </thead>
          <tbody className="text-sm font-normal">
            <tr>
              <td className="border border-gray-300 p-2 font-medium" colSpan="2">Total Harvest</td>
              <td className="border border-gray-300 p-2 font-medium">{totalWeight.toFixed(2)} kg</td>
            </tr>
            {data.length > 0 ?(
              currentRows.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{item.id}</td>
                  <td className="border border-gray-300 p-2">{item.time}</td>
                  <td className="border border-gray-300 p-2">{item.value} kg</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-gray-300 p-2 text-red-700" colSpan="3">No data available</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex items-center mt-5 w-72 gap-4">
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1} 
            className={`text-xs font-medium px-3 py-2 bg-orange-100 rounded-full ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <span className="text-xs font-medium text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages} 
            className={`text-xs font-medium px-3 py-2 bg-orange-100 rounded-full ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>
    );
};

export default FarmerTable;
