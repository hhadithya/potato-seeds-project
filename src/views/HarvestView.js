import React, { useState, useContext, useEffect } from 'react';
import FarmerTable from '../components/FarmerTable';
import { realTimeDB } from '../firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import Spinner from '../components/Spinner';
import { UserContext } from '../context/UserContext';
import { getDecryptedUserRole } from '../Encrypt';

const HarvestView = () => {
  const [role, setRole] = useState('');
  const { userRole, section } = useContext(UserContext);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operatorSection, setOperatorSection] = useState('');

  const handleDateChange = (e) => {
    if (e.target.id === 'dateFrom') {
      setDateFrom(e.target.value);
    }
    if (e.target.id === 'dateTo') {
      setDateTo(e.target.value);
    }
  };

  useEffect(() => {
    setRole(getDecryptedUserRole(userRole));
  }, [userRole]);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
  
    if (dateFrom && dateTo) {
      setLoading(true);
      console.log(operatorSection);

      const sectioFilter = operatorSection || section;

      const dateRef = ref (realTimeDB, `${sectioFilter}/${sectioFilter}-dates`);
      onValue(dateRef, async (snapshot) => {
        const dates = snapshot.val();
        console.log(dates);
        
        let filteredDates = Object.values(dates).filter((date) => {
          date = date.replaceAll("/", "-");
          return date >= dateFrom && date <= dateTo;
        });
        console.log(filteredDates);
        const fetchHarvestData = async (date) => {
          return new Promise((resolve) => {
            const docRef = ref(realTimeDB, `${sectioFilter}/${date}`);
            onValue(docRef, (snapshot) => {
              const data = snapshot.val();
              const results = [];
              if (data) {
                Object.entries(data).forEach(([id, value]) => {
                  Object.entries(value).forEach(([time, harvest]) => {
                    results.push({
                      id,
                      date,
                      time,
                      value: harvest,
                    });
                  });
                });
              }
              resolve(results);
            });
          });
        };
  
        const promises = filteredDates.map((date) => fetchHarvestData(date));
        const allResults = await Promise.all(promises);
  
        // Flatten the array of results
        const finalResults = allResults.flat();
  
        setData(finalResults);
        setLoading(false);
      });
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Date Filters */}
      <div className="flex justify-center gap-8 mb-6 items-center mb-10">
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
          className={`px-6 py-1 rounded-full text-sm font-medium bg-orange-100 w-24 h-10 mt-5 duration-200
            ${dateFrom && dateTo && (operatorSection || section)? 'cursor-pointer hover:bg-orange-200 active:shadow-md' : 'cursor-not-allowed'}
            `}
          onClick={handleFilterSubmit}
        >
          Filter
        </button>
      </div>

      {/* Show Spinner while loading */}
      {loading ? (
        <Spinner />
      ) : (
        <FarmerTable data={data} />
      )}
    </div>
  );
};

export default HarvestView;
