import React from 'react';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/NavBar';
import ProfileCard from '../components/ProfileCard';
import { useLocation } from 'react-router-dom';
import FarmerHarvestTable from '../components/FarmerHarvestTable';

const ProfileView = () => {

  const location = useLocation();

  console.log(location.pathname.slice(0,8));

  return (
    <div className='flex h-screen'>
      <NavBar title="Profile View" />
      <div className='fixed'>
        <Sidebar />
      </div>
      <div className='w-72'></div>
      <div className='p-7 text-2xl font-semibold flex-1'>
          <div className='flex flex-col rounded-lg p-5 mt-12'>
            <h1 className='text-lg font-medium text-center'>Profile Info </h1>
            <ProfileCard />
          </div>
          <hr className='h-px my-4 bg-gray-200 border-0 dark:bg-gray-700' />
          <div className='flex flex-col shadow-amber-500 p-5 mt-10'>
            <h1 className='text-lg font-medium text-center'>Monthly Harvesting</h1>
            <FarmerHarvestTable />
          </div>
      </div>
    </div>
  );
};

export default ProfileView;
