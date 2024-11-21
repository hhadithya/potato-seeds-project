import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/NavBar';
import OutSection from '../components/OutSection';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Harvest Out';
  }, []);

  return( 
    <div className='flex h-screen'>
      <NavBar title="Harvest Out"/>
      <div className='fixed'>
        <Sidebar />
      </div>
      <div className='w-72'></div>
      <div className='p-7 text-2xl font-semibold flex-1'>
        <OutSection />
      </div>
    </div>
  );
};

export default Dashboard;