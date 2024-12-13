import React, { useEffect, useState, useContext } from 'react';
import { db, storage } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserContext } from '../context/UserContext';
import { getDecryptedUserRole } from '../Encrypt';

const ProfileCard = () => {
    const [role, setRole] = useState('');
    const { userRole } = useContext(UserContext);
    const id = useParams().id;
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadMessage, setLoadMessage] = useState("Data Loading");

    const [profileData, setProfileData] = useState({
        farmerId: '',
        fullName: '',
        gender: '',
        nicNumber: '',
        mobileNumber: '',
        GND: '',
        DS: '',
        imageUrl: "/assets/images/user.jpg",
    });
    // const [profileImage, setProfileImage] = useState("/assets/images/user.jpg");
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setRole(getDecryptedUserRole(userRole));
        // console.log(userRole);
        setLoading(true);

        const fetchFarmerData = async () => {
            try {
                const farmerDoc = doc(db, 'farmers', id);
                const docSnap = await getDoc(farmerDoc);
                if (docSnap.exists()) {
                    setProfileData(docSnap.data());
                    setLoading(false);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                setError('Error fetching farmer data');
                console.error("Error fetching farmer data:", error);
            }
        };

        fetchFarmerData();
    }, [id, userRole]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const toggleEdit = async () => {
        setIsEditing(!isEditing);

        if (isEditing) {
            updateData();
        }

    };

    const updateData = async () => {
        setLoadMessage("Updating Data");
        setLoading(true);
        const docRef = doc(db, 'farmers', id);

        try {
            if (image){
                const imageRef = ref(storage, `images/${profileData.farmerId}`);
                await uploadBytes(imageRef, image);
                var downloadURL = await getDownloadURL(imageRef);
            } else{
                downloadURL = profileData.imageUrl; 
            }

            await updateDoc(docRef, {
                nicNumber: profileData.nicNumber,
                mobileNumber: profileData.mobileNumber,
                GND: profileData.GND.charAt(0).toUpperCase() + profileData.GND.slice(1),
                DS: profileData.DS.charAt(0).toUpperCase() + profileData.DS.slice(1),
                imageUrl: downloadURL,
            });
            setMessage('Document updated successfully');
            setLoading(false);
        } catch (error) {
            setError('Error updating document');    
            console.error('Error adding document: ', error);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const imageUrl = URL.createObjectURL(file);
            setProfileData({ ...profileData, imageUrl });
            setIsEditing(true);
        }
        
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
        <>
            {loading && <div className="text-center w-full font-medium text-sm mb-10 p-3 bg-blue-100 text-blue-700 rounded " style={{marginTop: "-1.5rem"}}>{loadMessage}...</div>}
            {error && <div className="text-center text-sm mb-10 w-full p-3 bg-red-100  font-medium text-red-700 rounded" style={{marginTop: "-1.5rem"}}>{error}</div>}
            {message && <div className="text-center text-sm mb-10 w-full p-3 bg-amber-100  font-medium text-amber-700 rounded" style={{marginTop: "-1.5rem"}}>{message}</div>}
            <div className="flex justify-center gap-10 mt-8">
                <div
                    className="relative w-32 h-32 rounded-lg overflow-hidden"
                    onMouseEnter={() => {role === "Admin" ? setIsHovered(true) : setIsHovered(false)}}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <img src={profileData.imageUrl} alt="farmer" className="w-full h-full object-cover border rounded-lg" />
                    {isHovered && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <label className="text-white cursor-pointer text-sm font-medium">
                                Edit Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2 font-medium text-sm">
                    <div className="flex items-center gap-6">
                        <label className="mr-4">Farmer ID: </label>
                        <input
                            type="text"
                            name="farmerId"
                            value={profileData.farmerId}
                            onChange={handleInputChange}
                            className="w-40 font-normal text-sm border rounded px-2 py-1 mt-1 bg-gray-50"
                            readOnly
                        />
                    </div>

                    <div className="flex items-center gap-0">
                        <label className="mr-4">Farmer Name: </label>
                        <input
                            type="text"
                            name="fullName"
                            value={profileData.fullName}
                            onChange={handleInputChange}
                            className="w-40 font-normal text-sm border rounded px-2 py-1 mt-1 bg-gray-50"
                            readOnly
                        />
                    </div>
                    
                    <div className="flex items-center gap-10">
                        <label className="mr-4">Gender: </label>
                        <input
                            type="text"
                            name="gender"
                            value={profileData.gender}
                            onChange={handleInputChange}
                            className="w-40 font-normal text-sm border rounded px-2 py-1 mt-1 bg-gray-50 focus:outline-none"
                            readOnly
                        />
                    </div>
                    
                    <div className="flex items-center gap-16">
                        <label className="mr-4">NIC: </label>
                        <input
                            type="text"
                            name="nicNumber"
                            value={profileData.nicNumber}
                            onChange={handleInputChange}
                            className={`w-40 text-sm rounded px-2 py-1 mt-1 focus:outline-none focus:ring-amber-500 focus:border-amber-500
                                ${isEditing ? 'bg-white font-medium border-2' : 'bg-gray-50 font-normal border-1'}
                            `}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2 font-medium text-sm">
                    <div className="flex items-center gap-14">
                        <label className="mr-4">Mobile Number: </label>
                        <input
                            type="text"
                            name="mobileNumber"
                            value={profileData.mobileNumber}
                            onChange={handleInputChange}
                            className={`w-40 text-sm rounded px-2 py-1 mt-1 focus:outline-none focus:ring-amber-500 focus:border-amber-500
                                ${isEditing ? 'bg-white font-medium border-2' : 'bg-gray-50 font-normal border-1'}
                            `}
                            readOnly={!isEditing}
                        />
                    </div>

                    <div className="flex items-center gap-20">
                        <label className="mr-4">GN Division: </label>
                        <input
                            type="text"
                            name="GND"
                            value={profileData.GND}
                            onChange={handleInputChange}
                            className={`w-40 text-sm rounded px-2 py-1 mt-1 focus:outline-none focus:ring-amber-500 focus:border-amber-500
                                ${isEditing ? 'bg-white font-medium border-2' : 'bg-gray-50 font-normal border-1'}
                            `}
                            readOnly={!isEditing}
                        />
                    </div>  

                    <div className="flex items-center gap-3">
                        <label className="mr-4">Divisional Secretariats: </label>
                        <input
                            type="text"
                            name="DS"
                            value={profileData.DS}
                            onChange={handleInputChange}
                            className={`w-40 text-sm rounded px-2 py-1 mt-1 focus:outline-none focus:ring-amber-500 focus:border-amber-500
                                ${isEditing ? 'bg-white font-medium border-2' : 'bg-gray-50 font-normal border-1'}
                            `}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>
            </div>
            {role === 'Admin' && (
                <button
                    className="ml-16 px-6 py-1 rounded-full text-sm font-medium bg-orange-100 w-20 h-10 mb-2 hover:bg-orange-200 duration-200 active:shadow-md"
                    onClick={toggleEdit}
                >
                    {isEditing ? 'Save' : 'Edit'}
                </button>
            )}
        </>
    );
};

export default ProfileCard;
