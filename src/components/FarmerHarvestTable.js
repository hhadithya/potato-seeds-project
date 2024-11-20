import React, { useEffect, useState, useContext } from 'react';
import { farmerHarvestDetails } from '../firebase/firebaseFunctions'; 
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { getDecryptedUserRole } from '../Encrypt';
import Spinner from '../components/Spinner';

const FarmerHarvestTable = () => {
  const id = useParams().id;
  const { section, userRole } = useContext(UserContext);
  const [harvestData, setHarvestData] = useState([]);
  const [ role, setRole ] = useState('');
  const [operatorSection, setOperatorSection] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOperatorSection(section || operatorSection);
    setRole(getDecryptedUserRole(userRole));
  }, [userRole, section, operatorSection]);

  const handleDateChange = (e) => {
    if (e.target.id === 'dateFrom') {
      setDateFrom(e.target.value);
    }
    if (e.target.id === 'dateTo') {
      setDateTo(e.target.value);
    }
  };

  const handleFilterSubmit = async () => {
    setLoading(true);
    if (dateFrom && dateTo) {
      if (role !== "Admin"){
        setOperatorSection(section);
      }
      setHarvestData(await farmerHarvestDetails({ id, dateFrom, dateTo, operatorSection }));
      console.log("harvestData:", harvestData);
    }
    setLoading(false);
  }


  return (
    <>
      <div className="flex justify-center gap-8 mb-6 items-center mt-10">
      {role === 'Admin'  && (
            <div className="flex flex-col w-36">
              <label className="text-gray-600 text-sm font-medium">Section</label>
                <select
                  id="operatorSection"
                  name="operatorSection"
                  value={operatorSection}
                  onChange={(e) => setOperatorSection(e.target.value)}
                  required
                  className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="" disabled hidden>Select Section</option>
                  <option value="In">Harvest In</option>
                  <option value="Out">Harvest Out</option>
                </select>
              </div>
          )}
        <div className="flex flex-col w-40">
          <label className="text-gray-600 text-sm font-medium">Date From</label>
          <input
            type="date"
            className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            value={dateFrom}
            onChange={handleDateChange}
            id='dateFrom'
          />
        </div>
        <div className="flex flex-col w-40">
          <label className="text-gray-600 text-sm font-medium">Date To</label>
          <input
            type="date"
            className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            value={dateTo}
            onChange={handleDateChange}
            id='dateTo'
          />
        </div>
        <button
          className={`px-6 py-1 rounded-full text-sm font-medium bg-orange-100 w-24 h-10 mt-5  duration-200
              ${dateFrom && dateTo && operatorSection? 'cursor-pointer hover:bg-orange-200 active:shadow-md' : 'cursor-not-allowed'}
            `}
          onClick={handleFilterSubmit}
        >
          Filter
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      ): (
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
      )}
        
    </>
  );
};

export default FarmerHarvestTable;
