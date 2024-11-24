import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Spinner from '../components/Spinner';
import { getDecryptedUserRole } from '../Encrypt';
import { downloadExcel } from '../BackendFunctions';

const ProfileList = () => {
  const role = getDecryptedUserRole(localStorage.getItem('userRole'));
  const [farmers, setFarmers] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(true); // State to handle loading
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Farmer Profiles';
  }, []);

  useEffect(() => {
    const farmersCollection = collection(db, 'farmers');
    const unsubscribe = onSnapshot(
      farmersCollection,
      (snapshot) => {
        const farmersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })); 
        setFarmers(farmersList);
        setLoading(false); // Stop loading when data is fetched
      },
      (error) => {
        console.error('Error fetching farmers: ', error);
        setLoading(false); // Stop loading in case of error
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
  };

  const handleRowClick = (id) => {
    navigate(`/profile/${id}`);
  };

  const filteredFarmers = farmers.filter((farmer) =>
    farmer.id.includes(searchId)
  );

  const handleDownload = () => {
    downloadExcel({data: farmers, section:'Farmer Profiles'});
  };

  return (
    <div className="flex">
      <NavBar title="Farmer Profiles" />
      <div className="fixed">
        <Sidebar />
      </div>
      <div className="w-72"></div>
      <div className="flex-1 p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center float-right mr-48">
          <input
            type="text"
            placeholder="Search by ID"
            value={searchId}
            onChange={handleSearchChange}
            className="text-sm font-normal pl-2 w-32 text-gray-700 border rounded-md z-50 focus:ring-amber-400 focus:border-amber-500"
            style={{ marginTop: '-0.1rem', outline: 'none'}}
          />
        </div>
        {(role === "Admin") && (         
          <div className="absolute right-0 z-50" style={{marginTop: "-0.2rem", right: "22.5rem"}}>
            <button
              onClick={handleDownload}
              className="rounded-full border z-50 focus:ring-amber-400 w-14 h-10 cursor-pointer hover:bg-orange-200 active:shadow-md"
              style={{ marginLeft: "-1.2rem" }}
              title='Download Farmer List'
            >
              <img
                src="/assets/images/download.svg"
                alt="Download Report"
                className="w-5 h-5 ml-4"
                style={{ marginLeft: "1.1rem" }}
              />
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center mt-24 h-full w-full">
            <Spinner /> {/* Spinner component */}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white mt-20 flex justify-center">
            {/* Table */}
            <table className="w-11/12 table-auto text-sm">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                    ID
                  </th>
                  <th className="px-9 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                    Name
                  </th>
                  <th className="px-10 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-8 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                    DS
                  </th>
                  <th className="px-8 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                    GND
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(farmer.id)}
                  >
                    <td className="px-7 py-3 whitespace-nowrap">
                      <img
                        src={farmer.imageUrl}
                        alt={farmer.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {farmer.id}
                    </td>
                    <td className="px-9 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {farmer.fullName}
                      </div>
                    </td>
                    <td className="px-10 py-3 whitespace-nowrap">
                      {farmer.mobileNumber}
                    </td>
                    <td className="px-8 py-3 whitespace-nowrap">
                      {farmer.DS}
                    </td>
                    <td className="px-8 py-3 whitespace-nowrap">
                      {farmer.GND}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileList;
