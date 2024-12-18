import React, { useEffect, useState, useContext } from 'react';
import { farmerHarvestDetails } from '../firebase/firebaseFunctions'; 
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { getDecryptedUserRole } from '../Encrypt';
import Spinner from '../components/Spinner';
import { downloadExcel } from '../BackendFunctions';


const FarmerHarvestTable = () => {
  const id = useParams().id;
  const { section, userRole } = useContext(UserContext);
  const [harvestData, setHarvestData] = useState([]);
  const [ role, setRole ] = useState('');
  const [operatorSection, setOperatorSection] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setOperatorSection(section || operatorSection);
    setRole(getDecryptedUserRole(userRole));
  }, [userRole, section, operatorSection]);

  const handleDateChange = (e) => {

    const todayDate = new Date().toISOString().split('T')[0];
    if (e.target.value > todayDate) {
      setError('Date cannot be in the future');
      return;
    }

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
      // console.log("harvestData:", harvestData);
    }
    setLoading(false);
  }

  const handleDownload = () => {
    // console.log("harvest",harvestData);
    downloadExcel({ data:harvestData, dateFrom, dateTo, id, section: operatorSection });
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <>
      {error && <div className="text-center text-sm w-full p-3 bg-red-100 font-medium text-red-700 rounded mt-10" style={{marginTop: "1rem", marginBottom: "-0.3rem"}}>{error}</div>}
      <div className="flex justify-center gap-8 mb-6 items-center mt-8">
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
        {(harvestData.length > 0 && role === "Admin") && (         
            <button
              onClick={handleDownload}
              className="mt-5 rounded-full bg-orange-100 w-14 h-10 duration-200 cursor-pointer hover:bg-orange-200 active:shadow-md"
              style={{ marginLeft: "-1.2rem" }}
              title='Download Excel'
            >
              <img
                src="/assets/images/download.svg"
                alt="Download Report"
                className="w-5 h-5 ml-4"
                style={{ marginLeft: "1.1rem" }}
              />
            </button>
      )}
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
