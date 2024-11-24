import * as XLSX from 'xlsx';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';

const backendURL = 'https://soursop-backend.vercel.app';
// const backendURL = 'http://192.168.1.76:5000';

export const tokenGen = async () => {
    try {
        const response = await fetch(`${backendURL}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        await response.json();
        // const result = await response.json();
        // console.log(result);
    } catch (error) {
        return;
        // console.error('Error generating token: ', error);
    }
};

export const sendSMS = async ({ number, ID, name, weight, date, time, transaction_id }) => {

      try{
        const responce = await fetch(`${backendURL}/api/send-sms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number: number,
                ID: ID,
                name: name,
                weight: weight,
                date: date,
                time: time,
                transaction_id: transaction_id
            }),
        });
        await responce.json();
        // console.log(result);
        return 1;
    } catch (error) {
        // console.error('Error sending mail: ', error);
        return 0;
    }
};

export const sendAdminSMS = async ({ dateFrom, dateTo, totalWeight }) => {
    const adminRef = collection(db, 'admin');
    const smsRef = doc(db, 'sms', '001');
    const adminSnapshot = await getDocs(adminRef);
    const smsSnapshot = await getDoc(smsRef);

    let adminNumbers = [];
    const transaction_id = smsSnapshot.data().transaction_id;
    // console.log(transaction_id);
    // console.log(dateFrom, dateTo, totalWeight);

    adminSnapshot.forEach((doc) => {
        adminNumbers.push(doc.data().mobileNumber.slice(3));
    });
    // console.log(adminNumbers);

    try {
        const response = await fetch(`${backendURL}/api/send-admin-sms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                numbers: adminNumbers,
                dateFrom: dateFrom,
                dateTo: dateTo,
                totalWeight: totalWeight,
                transaction_id: transaction_id
            }),
        });
        await response.json();
        await updateDoc(smsRef, {
            transaction_id: transaction_id + 1
        });

        return 1;
    } catch (error) {
        // console.error('Error sending mail: ', error);
        return 0;
    }
};

// export const sendRole = async ({ role, email }) => {
//     try {
//         const response = await fetch(`${backendURL}/api/send-role`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 [email]: role,
//             }),
//         });
//         const result = await response.json();
//         console.log(result);
//     } catch (error) {
//         console.error('Error sending role: ', error);
//     }
// };

// export const getRole = async ({email}) => {
//     try {
//         const response = await fetch(`${backendURL}/api/get-role`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 email: email,
//             }),
//         });
//         const result = await response.json();
//         // console.log(result);
//         return result;
//     } catch (error) {
//         console.error('Error getting role: ', error);
//     }
// };

// export const deleteRole = async ({email}) => {
//     try {
//         const response = await fetch(`${backendURL}/api/delete-role`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 email: email,
//             }),
//         });
//         const result = await response.json();
//         console.log(result);
//     } catch (error) {
//         console.error('Error deleting role: ', error);
//     }
// }

export const downloadExcel = ({ data, dateFrom, dateTo, id, section }) => {
    const selectedColumns = (item) => ({
        "Farmer ID": item.id,
        "Full Name": item.fullName,
        "Gender": item.gender,
        "Mobile Number": item.mobileNumber,
        "DS": item.DS,
        "GND": item.GND,
        "NIC Number": item.nicNumber,
        "Cumulative In": item['c-weight'],
        "Cumulative Out": item['cOutWeight'],
    });

    const selectedHarvestColumns = (item) => ({
        "Farmer ID": item.id,
        "Date": item.date,
        "Time": item.time,
        "Weight": item.value,
    });

    const selectedFarmerHarvestColumns = (item) => ({
        "Date": item.date,
        "Time": item.time,
        "Weight": item.value,
    });
  
    const processedData = section === 'Farmer Profiles' 
      ? data.map(selectedColumns) 
      : id ? data.map(selectedFarmerHarvestColumns): data.map(selectedHarvestColumns);

    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
  
    if (section === 'Farmer Profiles') {
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmer Profile Data');
      XLSX.writeFile(workbook, 'Farmer Profile List.xlsx');
      return;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Harvest Data');
    const fileName = id
      ? `FarmerHarvest${section}Data_${id}(${dateFrom} to ${dateTo}).xlsx`
      : `Harvest${section}Data(${dateFrom} to ${dateTo}).xlsx`;
  
    XLSX.writeFile(workbook, fileName);
  };
  