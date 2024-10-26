import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/NavBar';
import PassbookEntry from '../components/PassbookEntry';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Add Harvest';
  }, []);

  return( 
    <div className='flex h-screen'>
      <NavBar title="Add Harvest"/>
      <div className='fixed'>
        <Sidebar />
      </div>
      <div className='w-72'></div>
      <div className='p-7 text-2xl font-semibold flex-1'>
        <PassbookEntry />
      </div>
    </div>
  );
};

export default Dashboard;