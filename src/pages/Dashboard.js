import React, { useEffect, useState, useContext } from 'react';
import BarChart from '../components/BarChart';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Spinner from '../components/Spinner';  // Import the spinner component
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { getHarvestData } from '../firebase/firebaseFunctions';
import NavBar from '../components/NavBar';
import { UserContext } from '../context/UserContext';
import { getDecryptedUserRole } from '../Encrypt';


const Dashboard = () => {
  const { userRole, userName, section } = useContext(UserContext);
  const [farmerCount, setFarmerCount] = useState(0);
  const [yearHarvest, setYearHarvest] = useState(0);
  const [monthHarvest, setMonthHarvest] = useState(0);
  const [harvestArray, setHarvestArray] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [topMonthId, setTopMonthId] = useState('');
  const [topYearId, setTopYearId] = useState('');
  const [topYearHarvest, setTopYearHarvest] = useState(0);
  const [topMonthHarvest, setTopMonthHarvest] = useState(0);
  const [role, setRole] = useState('');

  const [topMonthProfile, settopMonthProfile] = useState({
    farmerId: '',
    fullName: '',
    imageUrl: '',
  });

  const [topYearProfile, settopYearProfile] = useState({
    farmerId: '',
    fullName: '',
    imageUrl: '',
  });

  useEffect(() => {
    setRole(getDecryptedUserRole(userRole));
    console.log('User role:', userRole);
    console.log('User Name:', userName);
    const fetchHarvestData = async () => {
      try {
        const result = await getHarvestData({ section });
        // console.log(result.farmerTopYear);
        // console.log(result.topFarmerThisMonth);
        // console.log(result.maxHarvestThisMonth );

        const maxKey = Object.entries(result.farmerTopYear).reduce((max, [key, value]) =>
          value > result.farmerTopYear[max] ? key : max
        , Object.keys(result.farmerTopYear)[0]);

        setTopYearId(maxKey);
        fetchData(maxKey, 'topYear');
        setTopYearHarvest(result.farmerTopYear[maxKey].toFixed(2));

        setTopMonthId(result.topFarmerThisMonth);
        fetchData(result.topFarmerThisMonth, 'topMonth');
        setTopMonthHarvest(result.maxHarvestThisMonth.toFixed(2));

        setYearHarvest(result.totalHarvestThisYear.toFixed(2));
        setMonthHarvest(result.totalHarvestThisMonth.toFixed(2));
        setHarvestArray(result.totalHarvestPerMonth);
        setLoading(false); // Data fetched, set loading to false
      } catch (error) {
        console.error('Error fetching harvest data:', error);
        setLoading(false); // Handle errors and stop spinner
      }
    };

    fetchHarvestData();
  }, [userRole, userName, section]);

  const fetchData = async (id, title) => { 
    try {
      const farmerDoc = doc(db, 'farmers', id);
      const docSnap = await getDoc(farmerDoc);
      if (docSnap.exists()) {
          if (title === 'topYear') {
            settopYearProfile(docSnap.data());
          } else {
            settopMonthProfile(docSnap.data());
          }
      } else {
          console.log("No such document!");
      }
    } catch (error) {
        console.error("Error fetching farmer data:", error);
    }

  };


  const stats = [
    { label: 'Total Harvest Today', value: `${0} kg` },
    { label: 'Total Harvest This Month', value: `${monthHarvest} kg` },
    { label: 'Total Harvest This Year', value: `${yearHarvest} kg` },
    { label: 'Total Farmers Registered', value: `${farmerCount}` }
  ];

  useEffect(() => {
    document.title = 'Potato Seeds Dashboard';

    const unsubscribe = onSnapshot(
      collection(db, 'farmers'),
      (snapshot) => {
        setFarmerCount(snapshot.size);
      },
      (error) => {
        console.error('Error fetching farmer count: ', error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className='flex h-screen'>
      <NavBar title="Dashboard" />
      <div className='fixed'>
        <Sidebar />
      </div>
      <div className='w-72'></div>
      <div className='p-7 text-2xl font-semibold flex-1'>
        {/* Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner /> {/* Display Spinner while loading */}
          </div>
        ) : (
          <>
          {(section === 'In' || role === 'Admin') && (
              <div className='flex justify-center gap-12 mt-10 mb-5'>
              <Card
                id={topYearId}
                name={topYearProfile.fullName}
                harvest={topYearHarvest}
                image={topYearProfile.imageUrl}  
                title="Top harvester this year"
                subtitle={'Year'}
              />
              <Card
                id={topMonthId}
                name={topMonthProfile.fullName}
                harvest={topMonthHarvest}
                image={topMonthProfile.imageUrl}  
                title="Top harvester this month"
                subtitle={'Month'}
              />
            </div>
            )}
            <div className={`p-7 font-semibold flex-1 mb-8 ${section === "Out" && ("mt-10")}`}>
              <div className="flex justify-center gap-24 mt-2">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <h3 className="font-semibold text-base w-32">{stat.label}</h3>
                    <div className="mt-2 border rounded-lg px-4 py-2">
                      <span className="text-base font-medium text-gray-600">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='ml-16 mr-16 pb-10'>
              <BarChart dataSet={harvestArray} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
