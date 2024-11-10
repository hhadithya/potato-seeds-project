import React, { useEffect, useState, useContext } from 'react';
import { farmerMonthlyHarvest } from '../firebase/firebaseFunctions';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const FarmerHarvestTable = () => {
  const id = useParams().id;
  const { section } = useContext(UserContext);
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [harvestData, setHarvestData] = useState([]);

  useEffect(() => {
    const fetchHarvestData = async () => {
      try {
        console.log(id);
        const result = await farmerMonthlyHarvest({ farmerId: id , year, month, section });
        console.log(result);
        setHarvestData(result || []);
      } catch (error) {
        console.error('Error fetching harvest data:', error);
      }
    };

    fetchHarvestData();
  }, [id, year, month, section]);

  const handleYearChange = (e) => setYear(Number(e.target.value));
  const handleMonthChange = (e) => setMonth(Number(e.target.value));

  return (
    <>
      <div className="flex ml-20 mt-5 mb-5">
        <div className="w-32">
          <select
            value={year}
            onChange={handleYearChange}
            className="font-medium text-sm rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500 mt-2 mb-1"
          >
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="w-32" style={{ marginLeft: '-1rem' }}>
          <select
            value={month}
            onChange={handleMonthChange}
            className="font-medium text-sm rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500 mt-2 mb-1"
          >
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto flex flex-col justify-center items-center mt-5">
        <table className="table-auto border-collapse border border-gray-300 w-4/5 text-left">
          <thead className="bg-orange-50 text-base text-gray-800">
            <tr>
              <th className="border border-gray-300 p-2 font-medium">Date</th>
              <th className="border border-gray-300 p-2 font-medium">Time</th>
              <th className="border border-gray-300 p-2 font-medium">Weight</th>
            </tr>
          </thead>
          <tbody className="text-sm font-normal">
            <tr>
              <td className="border border-gray-300 p-2 font-medium" colSpan="2">Total Harvest</td>
              <td className="border border-gray-300 p-2 font-medium">
                {(harvestData.reduce((total, item) => total + item.value, 0).toFixed(2))} kg
              </td>
            </tr>
            {harvestData.length > 0 ? (
              harvestData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{item.date}</td>
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
      </div>
    </>
  );
};

export default FarmerHarvestTable;
