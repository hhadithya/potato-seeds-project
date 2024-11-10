import React, { useState, useContext } from 'react';
import FarmerTable from '../components/FarmerTable';
import { realTimeDB } from '../firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import Spinner from '../components/Spinner';
import { UserContext } from '../context/UserContext';

const HarvestView = () => {
  const { userRole, section } = useContext(UserContext);
  const [date, setDate] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [operatorSection, setOperatorSection] = useState('');

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    if (date) {
      setLoading(true); // Show spinner when filter button is clicked
      console.log(operatorSection);
      const dbRef = ref(realTimeDB, `${operatorSection || section}/` + date.replace(/-/g, '/'));

      onValue(
        dbRef,
        (snapshot) => {
          const data = snapshot.val();
          console.log(data);
          if (data) {
            const dataArray = Object.keys(data).map((key) => ({
              ...data[key],
              id: key,
            }));
            setData(dataArray);
          } else {
            setData([]);
            console.log('No data available');
          }
          setLoading(false); // Hide spinner after data is loaded
        },
        (errorObject) => {
          console.error('The read failed: ' + errorObject.message);
          setLoading(false); // Hide spinner if there's an error
        }
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Date Filters */}
      <div className="flex justify-center gap-8 mb-6 items-center mb-10">
      {userRole === 'Admin'  && (
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
            value={date}
            onChange={handleDateChange}
          />
        </div>
        <div className="flex flex-col w-40">
          <label className="text-gray-600 text-sm font-medium">Date To</label>
          <input
            type="date"
            className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            value={date}
            onChange={handleDateChange}
          />
        </div>
        <button
          className="px-6 py-1 rounded-full text-sm font-medium bg-orange-100 w-24 h-10 mt-5 hover:bg-orange-200 duration-200"
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
