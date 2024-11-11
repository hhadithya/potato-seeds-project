import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { getDecryptedUserRole } from '../Encrypt';

const Navbar = ({title}) => {
  const { userRole, userName, section } = useContext(UserContext);
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(getDecryptedUserRole(userRole));
  }, [userRole]); 

  return (
    <div className="fixed top-0 left-72 w-10/12 bg-white p-4 z-50 shadow-sm">
      <div className='flex items-center justify-between'>
        {title === 'Profile View' ?
        <div className="flex items-center gap-3">
                <img
              src="/assets/images/back.svg"
              alt='back'
              className="w-6 h-6 object-cover z-50 cursor-pointer"
              onClick={() => window.history.back()}
          />
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
      :
        <h1 className="text-xl font-medium">{title}</h1>
      }
        <div className="flex flex-col mr-24">
          <p className="text-gray-900 font-medium" style={{marginBottom: "-4px"}}>{userName}</p>
          <p className="text-gray-700 text-sm">{role}{role === "Operator" && " | "  + section}</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;