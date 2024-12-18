import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || null);
  const [section, setSection] = useState(() => localStorage.getItem('section') || null);
  // const [email, setEmailContext] = useState(() => localStorage.getItem('email') || null);

//   setUserRole(getRole().role);

  // Save to localStorage whenever userRole or userName changes
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [userRole]);

  // useEffect(() => {
  //   if (email) {
  //     localStorage.setItem('email', email);
  //   } else {
  //     localStorage.removeItem('email');
  //   }
  // }, [email]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    } else {
      localStorage.removeItem('userName');
    }
  }, [userName]);

    useEffect(() => {
        if (section) {
            localStorage.setItem('section', section);
        } else {
            localStorage.removeItem('section');
        }
    }, [section]);

  return (
    <UserContext.Provider value={{ userRole, setUserRole, userName, setUserName, section, setSection }}>
      {children}
    </UserContext.Provider>
  );
};
