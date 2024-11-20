import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import "../stylesheets/print.css";
import { ref, update, set, get } from 'firebase/database';
import { realTimeDB, db } from '../firebase/firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { tokenGen, sendSMS } from '../BackendFunctions';

const PassbookEntry = () => {
  const {todayTotal, setTodayTotal} = useContext(UserContext);
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
  const [accumualateWeight, setAccumualateWeight] = useState(0);
  const [checkWeight, setCheckWeight] = useState(true);
  const [number, setNumber] = useState('');
  const [transactionID, setTransactionID] = useState('');
  const [inDates, setInDates] = useState([]);

  // Function to fetch farmer's name from Firestore using farmerId
  const fetchFarmerName = async (id) => {
    if (id) {
      try {
        // console.log(id);
        const docRef = doc(db, 'farmers', id); // Firestore collection 'farmers' with farmerId as document id
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEnableWeight(false); 

          if (weight) { 
            setIsButtonDisabled(false);
          }
          setError('');
          setMessage("Farmer found!");
          // console.log('Farmer data:', docSnap.data());
          setFarmerName(docSnap.data().fullName);
          setLineNumberChange(docSnap.data()["line-num"]);
          setLineNumber(docSnap.data()["line-num"]);
          setCWeight(docSnap.data()["c-weight"]);
          setPrintLine(docSnap.data()["print-line"]);
          setInDates(docSnap.data()["in-dates"]);
          // console.log(docSnap.data()["in-dates"]);
          setNumber(docSnap.data().mobileNumber);
          setTransactionID(docSnap.data().transactionID);
        } else {
          setMessage('');
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

    // setCWeightChange(parseFloat(inputWeight) + cWeight);
    // console.log("here");

    if (inputWeight) {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString();
      const formattedTime = currentDate.toTimeString().slice(0, 8);
      setDate(formattedDate);
      setTime(formattedTime);
      setCheckWeight(false);
    }

    // console.log(fa);
  };

  const addWeight = () => {
    // console.log(weight);
    setAccumualateWeight(parseFloat(weight) + accumualateWeight);
    setCWeightChange(parseFloat(weight) + accumualateWeight + cWeight);
    setWeight('');
    setIsButtonDisabled(false);
    setCheckWeight(true);
    // console.log(accumualateWeight);
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

    const farmerRef = ref(realTimeDB, `In/${year}/${month}/${day}/${farmerId}`);

    const inDatesRef = ref(realTimeDB, "In/In-dates");

    const docRef = doc(db, 'farmers', farmerId);
    setLoading(true);
    
      try {
        const newDate = `${year}/${month}/${day}`;
        const snapshot = await get(inDatesRef);
        let newInDates = {};
        if (snapshot.exists()) {
          newInDates = snapshot.val();
        }
  
        // Check if the date already exists
        if (Object.values(newInDates).includes(newDate)) {
          console.log('Date already exists in the list.');
        } else{
          let newKey = 0;
          while (newInDates.hasOwnProperty(newKey)) {
            newKey++;
          }
          newInDates[newKey] = newDate;
          await set(inDatesRef, newInDates);
        }

        await update(farmerRef, {
          [time]: parseFloat(parseFloat(accumualateWeight).toFixed(2)),
        });
        // console.log(inDates);
        if (inDates.includes(newDate) === false) {
          inDates.push(newDate);
        }

        await updateDoc(docRef, {
          "line-num": lineNumberChange + 1,
          "c-weight": parseFloat(parseFloat(cWeightChange).toFixed(2)),
          "print-line": printLine + 1,
          "in-dates": inDates,
          transactionID: transactionID + 1
      });

      // console.log('Data successfully added!');
      await tokenGen();
      const smsStatus = await sendSMS({
        number: number.slice(4),
        ID: farmerId,
        name: farmerName,
        weight: parseFloat(parseFloat(accumualateWeight).toFixed(2)),
        date: date,
        time: time,
        transaction_id: transactionID
      })
      while(!smsStatus){
        console.log('SMS failed to send');
      };
      setTodayTotal(todayTotal + parseFloat(parseFloat(accumualateWeight).toFixed(2)));
      handlePrint(); // Call print function

      setMessage('Data successfully added!');
      setAccumualateWeight(0);
      setWeight('');
      setDate('');
      setTime('');
      setIsButtonDisabled(true);
      setCheckState(false);


    } catch (error) {
      console.error('Error adding document: ', error);
      setError('Error registering farmer.');
      setMessage('');
    } finally {
      setLoading(false);
    }
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
      {message && <div className="text-center text-sm mb-10 w-full p-3 bg-orange-100  font-medium text-orange-700 rounded" style={{marginTop: "-1.5rem"}}>{message}</div>}
      {/* Farmer ID Input */}
      <div className="flex ml-16 items-center mb-4 gap-16">
        <div className="flex-col items-center mb-4">
          <div className="flex items-center mb-4 text-base font-medium">
            <label className="mr-4">Farmer ID: </label>
            <input
              type="text"
              value={farmerId}
              onChange={handleIdChange}
              className="text-sm border p-2 rounded-md w-20 focus:outline-none focus:ring-amber-400 focus:border-orange-500 text-center"
            />
          </div>

          <div className="flex items-center mb-4 text-base font-medium">
            <label className="mr-6">Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </label>
            <input
              type="text"
              value={farmerName}
              readOnly
              className="text-sm border p-2 rounded-md w-3/4 focus:outline-none focus:ring-amber-400 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="mb-4 flex-col" style={{marginTop: "-1.5rem"}}>
        {/* Weight Input */}

          <div className="flex items-center mb-4 flex-col font-medium">
            <label className="mr-6 text-base mb-1" style={{marginLeft: "-11rem"}}>Weight (kg)</label>
            <div className='flex items-center'>
              <input
                type="number"
                value={weight}
                onChange={handleWeightChange}
                readOnly={enableWeight}
                className="border p-2 rounded-md text-lg w-2/5 focus:outline-none focus:ring-amber-400 focus:border-orange-500 text-center"
              />
              <button className={`bg-orange-200 py-0.5 px-3 rounded-lg text-md font-medium ml-2 text-gray-600 text-black ${ checkWeight ? 'opacity-50' : 'hover:bg-orange-300 duration-300'}`}
                onClick={addWeight}
                disabled={checkWeight}
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
          className='w-4 h-4 text-orange-600 text-base bg-orange-100 border-orange-300 rounded focus:ring-white cursor-pointer transition duration-100'  
          onClick={handleCheckState}
          checked={checkState}
          // defaultChecked={checkState}
        />
        <label className="mr-6 text-sm text-orange-400">&nbsp;&nbsp;Start printing from a new page</label>
      </div>

      {/* Passbook Entry Preview */}
      {accumualateWeight ? (
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
            <span style={{fontFamily:"passBookFont"}} className="text-xs">{parseFloat(accumualateWeight).toFixed(2)}</span>
            <span style={{fontFamily:"passBookFont"}} className="text-xs">{parseFloat(cWeightChange).toFixed(2)}</span>
          </p>
        </div>
      ): null}

      {/* Add Entry Button */}
      <button
        onClick={handleAddEntry}
        disabled={isButtonDisabled}
        className={`bg-orange-200 py-2 px-12 rounded-lg text-base font-medium mt-5 text-gray-600 ${
          isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-300 duration-300 text-black'
        }`}
      >
        Add Entry
      </button>
    </div>
  );
};

export default PassbookEntry;
