import React, { useState, useEffect } from 'react';
import "../stylesheets/print.css";
import { ref, set } from 'firebase/database';
import { realTimeDB, db } from '../firebase/firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const PassbookEntry = () => {
  const [farmerId, setFarmerId] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [lineNumber, setLineNumber] = useState();
  const [lineNumberChange, setLineNumberChange] = useState();
  const [cWeight, setCWeight] = useState();
  const [cWeightChange, setCWeightChange] = useState();
  const [checkState, setCheckState] = useState(false);
  const [printLine, setPrintLine] = useState();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enableWeight, setEnableWeight] = useState(true);

  // Function to fetch farmer's name from Firestore using farmerId
  const fetchFarmerName = async (id) => {
    if (id) {
      try {
        console.log(id);
        const docRef = doc(db, 'farmers', id); // Firestore collection 'farmers' with farmerId as document id
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEnableWeight(false); 

          if (weight) { 
            setIsButtonDisabled(false);
          }

          console.log('Farmer data:', docSnap.data());
          setFarmerName(docSnap.data().fullName);
          setLineNumberChange(docSnap.data()["line-num"]);
          setLineNumber(docSnap.data()["line-num"]);
          setCWeight(docSnap.data()["c-weight"]);
          setPrintLine(docSnap.data()["print-line"]);
        } else {
          setIsButtonDisabled(true);
          setEnableWeight(true); 
          setError('Farmer not found.');
          setFarmerName(''); // Clear the name if farmer not found
        }
      } catch (error) {
        console.error('Error fetching farmer data:', error);
      }
    } else {
      setEnableWeight(true); 
      setFarmerName(''); // Clear name if farmerId is cleared
    }
  };

  const handleIdChange = (e) => {
    const id = e.target.value;
    
    setFarmerId(id);
    // Fetch farmer's name whenever the farmerId changes
    fetchFarmerName(id);
  };

  const handleWeightChange = (e) => {
    const inputWeight = e.target.value;
    setWeight(inputWeight);

    setCWeightChange(parseFloat(inputWeight) + cWeight);

    if (inputWeight) {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString();
      const formattedTime = currentDate.toLocaleTimeString();
      setDate(formattedDate);
      setTime(formattedTime);
    }

    // console.log(fa);
    setIsButtonDisabled(!inputWeight);
  };


  const handleCheckState = () => {
    if (checkState === true) {
      setLineNumberChange(lineNumber);
    } else {
      setLineNumberChange(1);
    }

    setCheckState(!checkState);
  }

  const handleAddEntry = async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); 
    const day = currentDate.getDate().toString().padStart(2, '0'); 

    const farmerRef = ref(realTimeDB, `${year}/${month}/${day}/${farmerId}`);

    const docRef = doc(db, 'farmers', farmerId);
    setLoading(true);
    
    try {
      await set(farmerRef, {
        time: `${time}`,
        value: parseFloat(parseFloat(weight).toFixed(2)),
      });

      await updateDoc(docRef, {
        "line-num": lineNumberChange + 1,
        "c-weight": parseFloat(parseFloat(cWeightChange).toFixed(2)),
        "print-line": printLine + 1,
      });

      // console.log('Data successfully added!');
      

      handlePrint(); // Call print function

      setMessage('Data successfully added!');

    } catch (error) {
      console.error('Error adding document: ', error);
      setError('Error registering farmer.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const addWeight = () => {
  };

  const handlePrint = () => {
    window.print(); // Trigger print dialog

    // Clear form fields after printing
    setFarmerId('');
    setFarmerName('');
    setWeight('');
    setDate('');
    setTime('');
    setIsButtonDisabled(true);
    setCheckState(false);
    setEnableWeight(true);
  };

  const calculateMargin = () => { 
    // if (lineNumber === 20 || lineNumber === 21) return `${-125 + (lineNumber - 19) * 3}px`;
    return `${15 + parseInt(lineNumberChange) * 15}px` 
  };

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

  return (
    <div className="flex flex-col items-center p-4 mt-16">
      {loading && <div className="text-center w-full font-medium text-sm mb-10 p-3 bg-blue-100 text-blue-700 rounded " style={{marginTop: "-1.5rem"}}>Data Processing...</div>}
      {error && <div className="text-center text-sm mb-10 w-full p-3 bg-red-100  font-medium text-red-700 rounded" style={{marginTop: "-1.5rem"}}>{error}</div>}
      {message && <div className="text-center text-sm mb-10 w-full p-3 bg-green-100  font-medium text-green-700 rounded" style={{marginTop: "-1.5rem"}}>{message}</div>}
      {/* Farmer ID Input */}
      <div className="flex items-center mb-4 gap-16">
        <div className="flex-col items-center mb-4">
          <div className="flex items-center mb-4 text-base font-medium">
            <label className="mr-4">Farmer ID: </label>
            <input
              type="text"
              value={farmerId}
              onChange={handleIdChange}
              className="text-sm border p-2 rounded-md w-20 focus:outline-none focus:ring-green-500 focus:border-green-500 text-center"
            />
          </div>

          {/* Farmer Name (Auto-filled) */}
          <div className="flex items-center mb-4 text-base font-medium">
            <label className="mr-6">Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </label>
            <input
              type="text"
              value={farmerName}
              readOnly
              className="text-sm border p-2 rounded-md w-3/4 focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="mb-4 flex-col" style={{marginTop: "-1.5rem"}}>
        {/* Weight Input */}

          <div className="flex items-center mb-4 flex-col font-medium">
            <label className="mr-6 text-base mb-1" style={{marginLeft: "-10rem"}}>Weight (kg)</label>
            <div className='flex items-center'>
              <input
                type="number"
                value={weight}
                onChange={handleWeightChange}
                readOnly={enableWeight}
                className="border p-2 rounded-md text-lg w-2/5 focus:outline-none focus:ring-green-500 focus:border-green-500 text-center"
              />
              <button className="bg-green-200 py-0.5 px-3 rounded-lg text-md font-medium ml-2 text-gray-600 hover:bg-green-300 duration-300 text-black"
                onClick={addWeight}
              >+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex mb-6 font-normal items-center"
        style={{marginTop: "-1 rem"}}
      >
        <input
          type="checkbox"
          className='w-4 h-4 text-green-600 text-base bg-green-100 border-green-300 rounded focus:ring-white cursor-pointer transition duration-100'  
          onClick={handleCheckState}
          checked={checkState}
        />
        <label className="mr-6 text-sm text-green-600">&nbsp;&nbsp;Start printing from a new page</label>
      </div>

      {/* Passbook Entry Preview */}
      {weight ? (
        <div 
          className="mb-4 text-sm text-gray-500 bg-gray-50 p-4 rounded border font-normal w-3/4 flex-col print-area"   
        >
          <span className="text-xs" style={{fontFamily:"passBookFont"}}>
            This will be printed on passbook<br/>
            ---------------------------------------------------
          </span>
          <p 
            className='grid grid-cols-5 text-center text- mt-3 mb-2'
          >
            <span style={{fontFamily:"passBookFont"}} className="text-xs"></span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Date</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Time</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Weight(kg)</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">Cumulative Weight(kg)</span>
          </p>
          <p 
            className='grid grid-cols-5 row-1 text-center justify-center text-xs mt-3 mb-2 print-text'
            style={{
              '--dynamic-margin': calculateMargin(lineNumber),
            }}
          >
            <span style={{fontFamily:"passBookFont"}} className="text-xs">{printLine}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">{date}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">{time}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">{weight}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">{parseFloat(cWeightChange).toFixed(2)}</span>
          </p>
        </div>
      ): null}

      {/* Add Entry Button */}
      <button
        onClick={handleAddEntry}
        disabled={isButtonDisabled}
        className={`bg-green-200 py-2 px-12 rounded-lg text-base font-medium mt-5 text-gray-600 ${
          isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-300 duration-300 text-black'
        }`}
      >
        Add Entry
      </button>
    </div>
  );
};

export default PassbookEntry;