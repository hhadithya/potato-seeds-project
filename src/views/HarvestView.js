import React, { useState, useContext, useEffect } from 'react';
import FarmerTable from '../components/FarmerTable';
import { realTimeDB } from '../firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import Spinner from '../components/Spinner';
import { UserContext } from '../context/UserContext';
import { getDecryptedUserRole } from '../Encrypt';
import { downloadExcel } from '../BackendFunctions';
import { sendAdminSMS, tokenGen } from '../BackendFunctions';

const HarvestView = () => {
  const [role, setRole] = useState('');
  const { userRole, section } = useContext(UserContext);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operatorSection, setOperatorSection] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  let totalWeight = 0;

  data.forEach((item) => {
    totalWeight += item.value;
  });

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

  const handleDownload = () => {
    downloadExcel({ data, dateFrom, dateTo, id:null });
  };

  const handleMessage = async () => {
    setMessage('Sending SMS...');
    await tokenGen();
    const smsStatus = await sendAdminSMS({
      dateFrom,
      dateTo,
      totalWeight
    })
    while(!smsStatus){
      setError('Error sending SMS.Retrying...');
      continue;
    };
    setMessage('SMS Sent Successfully');
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="container mx-auto p-4 mt-5">
      {error && <div className="text-center text-sm mb-10 w-full p-3 bg-red-100  font-medium text-red-700 rounded" style={{marginTop: "-1.5rem"}}>{error}</div>}
      {message && <div className="text-center text-sm mb-10 w-full p-3 bg-orange-100  font-medium text-orange-700 rounded" style={{marginTop: "-1.5rem"}}>{message}</div>}
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

      {(data.length > 0 && role === "Admin") && (         
          <div className="relative flex items-center left-32 w-1/2">
            <button
              onClick={handleDownload}
              className="rounded-full bg-orange-100 w-14 h-10 duration-200 cursor-pointer hover:bg-orange-200 active:shadow-md"
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

            <button
              onClick={handleMessage}
              className="rounded-full bg-orange-100 w-14 h-10 duration-200 cursor-pointer hover:bg-orange-200 active:shadow-md"
              style={{ marginLeft: "0.5rem" }}
              title='Send Message'
            >
              <img
                src="/assets/images/sendSMS.svg"
                alt="Send SMS"
                className="w-5 h-5 ml-4"
                style={{ marginLeft: "1.1rem" }}
              />
            </button>
        </div>
      )}



      {/* Show Spinner while loading */}
      {loading ? (
        <Spinner />
      ) : (
        <FarmerTable data={data} totalWeight={totalWeight} />
      )}
    </div>
  );
};

export default HarvestView;
