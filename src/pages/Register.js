import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RegisterForm from '../components/RegistrationForm';
import NavBar from '../components/NavBar';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Farmer Registration';
  }, []);

  return( 
    <div className='flex h-screen'>
      <NavBar title="Farmer Registration"/>
      <div className='fixed'>
        <Sidebar />
      </div>
      <div className='w-72'></div>
      <div className='p-7 text-2xl font-semibold flex-1'>
      {/* <h1 className="text-2xl font-medium">Farmer Registration</h1> */}
      <div className="flex justify-center gap-28 mt-12">
        <RegisterForm />
      </div>
      </div>
    </div>
  );
};

export default Dashboard;