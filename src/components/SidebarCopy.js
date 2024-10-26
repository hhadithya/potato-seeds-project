import React, { useState } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const SidebarCopy = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const Menus = [
    { name: 'Dashboard', icon: 'dashboard.svg', path: '/dashboard' },
    { name: 'Farmer Registration', icon: 'register.svg', path: '/register' },
    { name: 'Farmer Profiles', icon: 'profiles.svg', path: '/profiles' },
    { name: 'Harvest Details', icon: 'details.svg', path: '/details' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`${open ? 'w-60' : 'w-20'} duration-300 h-screen p-5 pt-8 relative`} style={{ backgroundColor: "#ecfdf5" }}>
      <IoIosArrowBack
        className={`absolute cursor-pointer -right-3 p-1 top-9 w-7 h-7 border-2 rounded-full border-green-200 ${!open && 'transform rotate-180'}`}
        style={{ color: "#052e16" }}
        onClick={() => setOpen(!open)}
      />
      <div className='flex gap-x-2 items-center'>
        <img
          src='/assets/images/logo.png'
          alt='avatar'
          className={`cursor-pointer duration-500 w-20`}
        />
        <h1 className={`origin-left text-xl font-semibold ${!open && 'scale-0'}`}>
          Soursop Portal
        </h1>
      </div>
      <ul className="pt-6">
        {Menus.map((menu, index) => (
          <li
            key={index}
            className={`flex gap-x-3 items-center p-2 rounded-md hover:bg-emerald-100 cursor-pointer ${menu.gap ? "mt-52" : "mt-2"} ${location.pathname === menu.path && 'bg-emerald-100'}`}
            onClick={() => navigate(menu.path)}
          >
            <span className='text-xl'>
              <img src={`/assets/images/${menu.icon}`} alt={menu.name} />
            </span>
            <span className={`${!open && 'hidden'} text-sm font-medium origin-left duration-200`}>{menu.name}</span>
          </li>
        ))}
        <li className='flex gap-x-3 items-center p-2 rounded-md hover:bg-emerald-100 cursor-pointer mt-2' onClick={handleLogout}>
          <span className='text-xl'>
            <img src='/assets/images/logout.svg' alt='Logout' />
          </span>
          <span className={`${!open && 'hidden'} text-sm font-medium origin-left duration-200`}>Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default SidebarCopy;
