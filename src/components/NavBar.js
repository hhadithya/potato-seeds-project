import React from 'react';

const Navbar = ({title}) => {
  return (
    <div className="fixed top-0 left-72 w-full bg-white p-4 z-50 shadow-sm">
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
    </div>
  );
};

export default Navbar;