import { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
// import { IoIosArrowBack } from "react-icons/io";
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const Sidebar = () => {
  // const [open, setOpen] = useState(true);
  const [open] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const Menus = [
    { title: 'Dashboard', icon: 'dashboard.svg', path: '/dashboard' },
    { title: 'Farmer Register', icon: 'addProfiles.svg', path: '/register' },
    { title: 'Farmer Profiles', icon: 'profiles.svg', path: '/profiles' },
    { title: 'Harvest Details', icon: 'details.svg', path: '/harvestdetails' },
    { title: 'Add Harvest', icon: 'register.svg', path: '/addHarvest' },
  ];

  return (
    <div className="flex">
    <div className={`${open ? 'w-72' : 'w-20'} duration-300 h-screen p-5 pt-8 relative bg-orange-200`}>
      {/* <IoIosArrowBack
        className={`absolute cursor-pointer -right-3 p-1 top-9 w-7 h-7 border-2 rounded-full border-green-200 ${!open && 'transform rotate-180'}`}
        style={{ color: "#052e16" }}
        onClick={() => setOpen(!open)}
      /> */}
        <div className={`flex gap-x-1 items-center ${open && "justify-center"}`}>
        <img
          src='/assets/images/logo.png'
          alt='avatar'
          className={`cursor-pointer duration-500 w-20`}
        />
          <h1
            className={`origin-left font-semibold text-xl duration-200 ${
              !open && "scale-0"
            }`}
          >
            Potato Seeds Portal
          </h1>
        </div>
        <ul className="pt-6 space-y-2">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`flex  rounded-md p-2 cursor-pointer hover:bg-orange-100 text-sm font-medium items-center gap-x-4  
              ${Menu.gap ? "mt-9" : "mt-2"} ${((location.pathname === Menu.path) || (location.pathname.slice(0, 8) + "s" === Menu.path))&& 'bg-orange-100'} ${
                index === 0 && "bg-light-white"
              } `}
              onClick={() => navigate(Menu.path)}
            >
              <img src={`/assets/images/${Menu.icon}`}  alt={Menu.title} />
              <span className={`${!open && "hidden"} origin-left duration-200`}>
                {Menu.title}
              </span>
            </li>
          ))}
        </ul>
        <ul className="pt-32 space-y-2">
          <li
            className="flex gap-x-3 items-center p-2 rounded-md hover:bg-orange-100 text-sm font-medium cursor-pointer"
            onClick={handleLogout}
          >
            <span className="text-xl">
              <img src="/assets/images/logout.svg" alt="Logout" />
            </span>
            <span className={`${!open && 'hidden'} origin-left duration-200`}>Logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default Sidebar;