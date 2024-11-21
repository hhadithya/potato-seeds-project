import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    nicNumber: '',
    mobileNumber: '',
    GND: '',
    DS: '',
    gender: '',
    farmerId: '', // Farmer ID as input
  });
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableButton, setEnableButton] = useState(false);
  const [lengthNIC, setLengthNIC] = useState(9);

  const handleNumberChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.slice(4),
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  useEffect(() => { 
    if (!formData.fullName || !formData.nicNumber || !formData.mobileNumber || !formData.GND || !formData.DS || !formData.gender || !formData.farmerId) {
      setEnableButton(false);
    } else {
      setEnableButton(true);
    }
  }, [formData, image]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.nicNumber || !formData.mobileNumber || !formData.GND || !formData.DS || !formData.gender || !formData.farmerId) {
      setError('Please fill all the required entries.');
      setMessage('');
      return;
    }

    setLoading(true); // Show loading screen

    try {
      if (image){
        const imageRef = ref(storage, `images/${formData.farmerId}`);
        await uploadBytes(imageRef, image);
        var downloadURL = await getDownloadURL(imageRef);
      } else{
        downloadURL = "https://firebasestorage.googleapis.com/v0/b/potato-seeds-project.appspot.com/o/images%2Fuser.jpg?alt=media&token=6ebe93c2-4a47-4ecd-8dc1-2b797d2da8f0 "; 
      }

      var nicType = document.getElementById('nicType').value;
      if (nicType === "New"){
        nicType = "";
      }

      // Set form data to Firestore with Farmer ID as document ID
      await setDoc(doc(db, 'farmers', formData.farmerId), {
        ...formData,
        "nicNumber" : formData.nicNumber + nicType,
        "mobileNumber" : "+94 " + formData.mobileNumber,
        imageUrl: downloadURL,
        "c-weight": 0,
        "cOutWeight": 0,
        "line-num":1,
        "print-line": 1,
        "GND": formData.GND.charAt(0).toUpperCase() + formData.GND.slice(1),
        "DS": formData.DS.charAt(0).toUpperCase() + formData.DS.slice(1),
        "transactionID": parseInt(formData.farmerId)*10000,
        "in-dates": [],
        "out-dates": [],
      });

      setMessage('Registration successful!');
      setError('');
      setFormData({
        fullName: '',
        nicNumber: '',
        mobileNumber: '',
        GND: '',
        DS: '',
        gender: '',
        farmerId: '',
      });

      const imageName = document.getElementById('imageName');
      imageName.value = null;

      setImage(null);
      setImageUrl(null);
    } catch (error) {
      console.error('Error adding document: ', error);
      setError('Error registering farmer.');
      setMessage('');
    } finally {
      setLoading(false); // Hide loading screen
    }
  };

  const handleSelection = (e) => {
    if (e.target.value === "V") {
      setLengthNIC(9);
    } else if (e.target.value === "New") {
      setLengthNIC(12);
    }
  };

  // Automatically remove error and message after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="bg-white pt-5 pl-10 pr-10 pb-10 rounded-lg w-full max-w-4xl">
      {loading && <div className="text-center  font-medium text-sm mb-4 p-3 bg-blue-100 text-blue-700 rounded">Loading...</div>}
      {error && <div className="text-sm mb-4 p-3 bg-red-100  font-medium text-red-700 rounded">{error}</div>}
      {message && <div className="text-sm mb-4 p-3 bg-amber-100  font-medium text-amber-700 rounded">{message}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10">
        <div className="flex-1">
          <div className="mb-4">
            <label className="block text-sm text-gray-700 font-medium">Farmer ID</label>
            <input
              type="text"
              name="farmerId"
              value={formData.farmerId}
              onChange={handleChange}
              maxLength={4}
              className="font-normal w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="font-normal w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 font-medium">NIC Number</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                name="nicNumber"
                value={formData.nicNumber}
                onChange={handleChange}
                maxLength={lengthNIC}
                className="font-normal w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
              <select 
                className="text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                onChange={handleSelection}  
                id='nicType'
              >
                <option value="V" className="text-xs hover:bg-amber-500">V</option>
                {/* <option value="X" className="text-xs hover:bg-amber-500">X</option> */}
                <option value="New" className="text-xs hover:bg-amber-500">New</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 font-medium">Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              maxLength={13}
              value={"+94 " + formData.mobileNumber}
              onChange={handleNumberChange}
              className="font-normal w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="mb-4">
              <label className="block text-sm text-gray-700 font-medium">GN Division</label>
              <input
                type="text"
                name="GND"
                value={formData.GND}
                onChange={handleChange}
                className="font-normal w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 font-medium">Divisional secretariats</label>
              <input
                type="text"
                name="DS"
                value={formData.DS}
                onChange={handleChange}
                className="font-normal w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 font-medium">Gender</label>
            <div className="flex items-center">
              <input
                type="radio"
                id="male"
                name="gender"
                value="Male"
                checked={formData.gender === 'Male'}
                onChange={handleChange}
                className="mr-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
              <label htmlFor="male" className="mr-4 text-sm font-medium">Male</label>
              <input
                type="radio"
                id="female"
                name="gender"
                value="Female"
                checked={formData.gender === 'Female'}
                onChange={handleChange}
                className="mr-2 border focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
              <label htmlFor="female" className="text-sm font-medium">Female</label>
            </div>
          </div>
          <button type="submit" className={`w-full bg-orange-200 px-3 py-2 rounded-lg text-base font-medium rounded-full duration-200
            ${enableButton ? 'hover:bg-orange-300 active:shadow-md' : 'opacity-50 cursor-not-allowed'}
            `}>Register</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-5 rounded-lg h-96">
          <div className="w-full">
            <label className="block text-sm text-gray-700 mb-2 font-medium">Upload your image</label>
            <input
              type="file"
              className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              onChange={handleImageChange}
              accept=".jpg, .jpeg, .png"
              id='imageName'
            />
            {imageUrl && <img src={imageUrl} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg " />}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
