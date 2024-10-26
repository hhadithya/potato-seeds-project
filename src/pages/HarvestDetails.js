import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
// import FarmerTable from '../components/FarmerTable';
import HarvestView from '../views/HarvestView';
import NavBar from '../components/NavBar';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Harvest Details';
  }, []);

  return( 
    <div className='flex h-screen'>
      <NavBar title="Harvest Details"/>
      <div className='fixed'>
        <Sidebar />
      </div>
      <div className='w-72'></div>
      <div className='p-7 text-2xl font-semibold flex-1'>
      {/* <h1 className="text-2xl font-medium">Harvest Details</h1> */}
      <div className="flex justify-center gap-28 mt-12">
        <HarvestView />
      </div>
      </div>
    </div>
  );
};

export default Dashboard;