import React, { useState, useEffect, useCallback } from 'react';
import { fetchFarmerData, updateCWeight } from '../firebase/firebaseFunctions';
import { realTimeDB } from '../firebase/firebaseConfig';
import { ref, get, set } from 'firebase/database';

const DefectCard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [operatorSection, setOperatorSection] = useState('');
  const [defectMode, setDefectMode] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [dateUpdate, setDateUpdate] = useState('');
  const [weightUpdate, setWeight] = useState(0);
  const [farmerIdTo, setFarmerIdto] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [farmerToName, setFarmerToName] = useState('');
  const [cWeight, setcWeight] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [totalHarvestThisDay, setTotalHarvestThisDay] = useState(0);
  const [outStatus, setOutStatus] = useState("");

  const handleAddEntry = async () => {
    const date = dateUpdate.replaceAll("-", "/");
    const docRef = ref(realTimeDB, `${operatorSection}/${date}/${farmerId}`);
    var newCWeight;
    setLoading(true);

    if ( totalHarvestThisDay < weightUpdate){
      newCWeight = cWeight + (weightUpdate - totalHarvestThisDay);
      setcWeight(newCWeight);
    }else{
      newCWeight = cWeight - (totalHarvestThisDay - weightUpdate);
      setcWeight(newCWeight);
    }

    const status = await updateCWeight({id: farmerId, cWeight: newCWeight, operatorSection: operatorSection});
  
    try {
     console.log("status:", status);
      const snapshot = await get(docRef);
      
      // snapshot.exists --> true
      if (true) {
        const data = snapshot.val();
        const updates = {};
        let lastTimeStamp;
        
        if(data){
          lastTimeStamp = Object.keys(data).pop();
        }else{
          lastTimeStamp = new Date().toTimeString().slice(0, 8);
        }
        console.log("lastTimeStamp:", lastTimeStamp);
        updates[`${lastTimeStamp}`] = parseFloat(parseFloat(weightUpdate).toFixed(2));
        await set(docRef, updates);
        setLoading(false);
        setMessage("Harvest Details updated successfully!");
        clearFields();
      } else {
        setLoading(false);
        setError("No data exists at the specified path");
        console.error("No data exists at the specified path");
      }
    } catch (error) {
      setLoading(false);
      setError("Error updating the entry");
      console.error("Error updating the entry:", error);
    }
  };
  

  const handleDateChange = useCallback(async (e) => {
      setDateUpdate(e.target.value);
      const date = e.target.value.replaceAll("-", "/");
      const docRef = ref(realTimeDB, `${operatorSection}/${date}/${farmerId}`);
      const snapshot = await get(docRef);
    
      if (snapshot.exists()) {
        const data = snapshot.val();
        let totalHarvest = 0;
        Object.entries(data).forEach(([time, harvest]) => {
          totalHarvest += harvest;
        });
        setTotalHarvestThisDay(totalHarvest);
      } else {
        setOutStatus("Don't have any harvest data");
        setError("No data exists at the date specified");
        setTotalHarvestThisDay(0);
      }
    }, [operatorSection, farmerId]);


  const handleIdChange = useCallback(async (e) => {
    setFarmerId(e.target.value);
    setFarmerName('');
    setcWeight('');
    await fetchFarmerData({id: e.target.value})
    .then((data) => {
      setError('');
      setMessage("Farmer found!");
      setFarmerName(data.fullName);
      if (operatorSection === "In") {
        setcWeight(data["c-weight"]);
      }else{
        setcWeight(data["cOutWeight"]);
      }        
    })
    .catch((error) => {
      setMessage('');
      setError("Farmer not found");
    });
  }, [operatorSection]);


  const handleIdToChange = async (e) => {
    setFarmerIdto(e.target.value);
    setFarmerToName('');
    setcWeight('');
    await fetchFarmerData({id: e.target.value})
    .then((data) => {
      setError('');
      setMessage("Farmer found!");
      setFarmerToName(data.fullName);
      setcWeight(data["c-weight"]);
    })
    .catch((error) => {
      setMessage('');
      // console.error("Error fetching farmer data:", error);
      setError("Farmer not found");
    });
  }

  useEffect(() => {
    if (farmerId && dateUpdate) {
      handleDateChange({ target: { value: dateUpdate } });
    }
  }, [farmerId, dateUpdate, handleDateChange]);

  const clearFields = () => {
    setOperatorSection('');
    setDefectMode('');
    setFarmerId('');
    setFarmerIdto('');
    setDateUpdate('');
    setWeight(0);
    setFarmerName('');
    setFarmerToName('');
    setcWeight('');
    setIsButtonDisabled(true);
    setTotalHarvestThisDay(0);
  }

  const handleModeChange = (e) => {
    const section = operatorSection;
    clearFields();
    setOperatorSection(section);
    setDefectMode(e.target.value);
  }

  const handleSectionChange = (e) => {
    clearFields();
    setOperatorSection(e.target.value);
  } 

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (operatorSection && defectMode && farmerId && dateUpdate && weightUpdate) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [operatorSection, defectMode, farmerId, dateUpdate, weightUpdate]);


  return (
    <div className="flex flex-col items-center mt-20">
      {loading && <div className="text-center w-full font-medium text-sm mb-10 p-3 bg-blue-100 text-blue-700 rounded " style={{marginTop: "-1.5rem"}}>Data Processing...</div>}
      {error && <div className="text-center text-sm mb-10 w-full p-3 bg-red-100  font-medium text-red-700 rounded" style={{marginTop: "-1.5rem"}}>{error}</div>}
      {message && <div className="text-center text-sm mb-10 w-full p-3 bg-orange-100  font-medium text-orange-700 rounded" style={{marginTop: "-1.5rem"}}>{message}</div>}
      {/* Date Filters */}
      <div className="flex justify-center gap-12 mb-6 items-center mt-2">
        <div className="flex flex-col w-36">
            <label className="text-gray-600 text-sm font-medium">Section</label>
            <select
                id="operatorSection"
                name="operatorSection"
                value={operatorSection}
                onChange={handleSectionChange}
                required
                className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
                <option value="" disabled hidden>Select Section</option>
                <option value="In">Harvest In</option>
                <option value="Out">Harvest Out</option>
            </select>
        </div>
        <div className="flex flex-col w-36">
            <label className="text-gray-600 text-sm font-medium">Defect Mode</label>
            <select
                id="defectMode"
                name="defectMode"
                value={defectMode}
                onChange={handleModeChange}
                required
                className="w-44 border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
                <option value="" disabled hidden>Select Defect Mode</option>
                <option value="Edit">Edit Harvest</option>
                {/* <option value="Transfer">Transfer Harvest</option> */}
            </select>
        </div>
      </div>
      
      {defectMode && (
        <div className="flex justify-center gap-12 mb-6 items-center mt-2">
        <div className="flex flex-col w-36">
          <label className="text-gray-600 text-sm font-medium">{defectMode === "Edit" ? "Farmer ID" : "Farmer ID (From)"}</label>
          <input
            type="text"
            value={farmerId}
            onChange={handleIdChange}
            className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {defectMode === "Transfer" && (
          <div className="flex flex-col w-36">
            <label className="text-gray-600 text-sm font-medium">Farmer ID (To)</label>
            <input
              type="text"
              value={farmerIdTo}
              onChange={handleIdToChange}
              className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
        </div>
        )}

        <div className="flex flex-col w-36">
          <label className="text-gray-600 text-sm font-medium">Date</label>
          <input
            type="date"
            className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            value={dateUpdate}
            onChange={handleDateChange}
            id='dateUpdate'
          />
        </div>

        <div className="flex flex-col w-36">
          <label className="text-gray-600 text-sm font-medium">Weight (kg)</label>
          <input
            type="number"
            value={weightUpdate === 0 ? "" : weightUpdate}
            onChange={(e) => setWeight(e.target.value)}
            className="border rounded p-2 text-gray-600 text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>
      )}

      <div 
        className={`mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded border font-normal flex-col print-area
        ${defectMode === "Edit" ? "w-3/4" : "w-3/4"}
          `}  
      >
        <span className="text-xs" style={{fontFamily:"passBookFont"}}>
          Transaction Details  { defectMode && ("| " + defectMode + " Mode")}<br/>
          ---------------------------------------
        </span>
        {defectMode === "Edit" && (
          <p className='flex flex-col gap-2 mt-3 mb-2 pl-10'>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Farmer Id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {farmerId}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {farmerName}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Update Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {dateUpdate}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Total Weight(kg)&nbsp;&nbsp;&nbsp;: {totalHarvestThisDay  ? parseFloat(totalHarvestThisDay).toFixed(2) : outStatus}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Update Weight(kg)&nbsp;&nbsp;: {weightUpdate ? parseFloat(weightUpdate).toFixed(2) : ""}</span>
          </p>
        )}

        {defectMode === "Transfer" && (
          <div className="grid grid-cols-2">
            <p className='flex flex-col gap-2 mt-3 mb-2 pl-10'>
              <span style={{fontFamily:"passBookFont"}} className="text-xs">Farmer Id (From)&nbsp;&nbsp;&nbsp;: {farmerId}</span>
              <span style={{fontFamily:"passBookFont"}} className="text-xs">Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;{farmerName}</span>
              <span style={{fontFamily:"passBookFont"}} className="text-xs mt-8">Update Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {dateUpdate}</span>
              <span style={{fontFamily:"passBookFont"}} className="text-xs">Exchange Weight(kg)&nbsp;&nbsp;: {weightUpdate}</span>
            </p>
            <p className='flex flex-col gap-2 mt-3 mb-2 pl-10'>
              <span style={{fontFamily:"passBookFont"}} className="text-xs">Farmer Id (To)&nbsp;&nbsp;&nbsp;: {farmerIdTo}</span>
              <span style={{fontFamily:"passBookFont"}} className="text-xs">Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;{farmerToName}</span>
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleAddEntry}
        disabled={isButtonDisabled}
        className={`bg-orange-200 py-2 px-8 rounded-lg text-base font-medium mt-5 text-black ${
          isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-300 active:shadow-md duration-300 text-black'
        }`}
      >
        Proceed Transaction
      </button>  

    </div>
  );
};

export default DefectCard;
