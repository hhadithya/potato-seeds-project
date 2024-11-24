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

export const downloadExcel = ({data, dateFrom, dateTo, id}) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Harvest Data');

    if(id){
        XLSX.writeFile(workbook, 'FarmerHarvestData_'+ id + '(' + dateFrom + ' to ' + dateTo + ').xlsx');
    }else{
        XLSX.writeFile(workbook, 'HarvestData(' + dateFrom + ' to ' + dateTo + ').xlsx');
    }
};