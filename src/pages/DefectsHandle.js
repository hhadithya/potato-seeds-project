import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar";
import DefectCard from "../components/DefectCard";

const DefectsHandle = () => {
    useEffect(() => {
        document.title = 'Defects Handle';
      }, []);
    
      return( 
        <div className='flex h-screen'>
          <NavBar title="Defects handle"/>
          <div className='fixed'>
            <Sidebar />
          </div>
          <div className='w-72'></div>
          <div className='p-7 text-2xl font-semibold flex-1'>
            <DefectCard />
          </div>
        </div>
      );
    
}

export default DefectsHandle;