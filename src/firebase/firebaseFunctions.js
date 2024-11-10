import { ref, get } from 'firebase/database';
import { realTimeDB } from '../firebase/firebaseConfig';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore'; 

const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth() + 1;
// const thisMonth = 1;

export const getHarvestData = async () => {

  try {
    // Initialize variables
    var farmerTopYear = [];
    var totalHarvestPerMonth = [];
    var totalHarvestThisYear = 0;
    var totalHarvestThisMonth = 0;
    var topFarmerThisMonth = null; // To store the key of the top farmer this month
    var maxHarvestThisMonth = 0;   // To track the max harvest value for the month

    // Loop through all 12 months (1 to 12 for January to December)
    for (let month = 1; month <= 12; month++) {
        // Format month as two digits
        const formattedMonth = month < 10 ? `0${month}` : month;
        const monthRef = ref(realTimeDB, `${thisYear}/${formattedMonth}`);
        
        // Monthly total and farmer harvest tracking
        let totalHarvest = 0;
        let farmerMonthlyTotals = {};

        const snapshot = await get(monthRef);
        const data = snapshot.val();

        if (data) {
            // Process each day’s data
            Object.values(data).forEach(date => {
                Object.entries(date).forEach(([farmerId, farmer]) => {
                    // Accumulate each farmer's monthly total
                    totalHarvest += farmer.value;
                    farmerMonthlyTotals[farmerId] = (farmerMonthlyTotals[farmerId] || 0) + farmer.value;
                });
            });
        }

        // Add the total for this month to the array
        totalHarvestPerMonth.push(totalHarvest);

        // Add each farmer's yearly total to `farmerTopYear`
        Object.entries(farmerMonthlyTotals).forEach(([farmerId, monthlyTotal]) => {
            if (!farmerTopYear[farmerId]) {
                farmerTopYear[farmerId] = 0;
            }
            farmerTopYear[farmerId] += monthlyTotal;
        });

        // Track the farmer with the maximum harvest for the current month
        if (month === thisMonth) {
            // eslint-disable-next-line no-loop-func
            Object.entries(farmerMonthlyTotals).forEach(([farmerId, monthlyTotal]) => {
                if (monthlyTotal > maxHarvestThisMonth) {
                    maxHarvestThisMonth = monthlyTotal;
                    topFarmerThisMonth = farmerId;
                }
            });

            totalHarvestThisMonth = totalHarvest;
        }

        // Add the monthly total to the yearly total
        totalHarvestThisYear += totalHarvest;
    }

    // Return an object containing total harvest for the year, this month, the array of all months, 
    // the yearly total for each farmer, and the top farmer for the current month
    return {
        totalHarvestThisYear,       // Total harvest for the year
        totalHarvestThisMonth,      // Total harvest for the current month
        totalHarvestPerMonth,       // Array of total harvests for each month
        farmerTopYear,              // Array of total harvests per farmer for the year
        topFarmerThisMonth,         // Key of the farmer with the max harvest this month
        maxHarvestThisMonth         // Maximum harvest value for the current month
    };
} catch (error) {
    console.error("Error fetching harvest data:", error);
    throw error;
}

};

export const farmerMonthlyHarvest = async ({ farmerId, year, month }) => {
  try {
    const formattedMonth = month < 10 ? `0${month}` : month;
    const monthRef = ref(realTimeDB, `${year}/${formattedMonth}`);
    const snapshot = await get(monthRef);
    const data = snapshot.val();

    if (!data) return null;


    const harvestData = [];
    Object.keys(data).forEach((date) => {
      // console.log(date);
      if (data[date][farmerId]) {
        // console.log(data[date][farmerId]);
        harvestData.push(
          {
            date: year + "/" + formattedMonth + "/" + date,
            time: data[date][farmerId].time,
            value: data[date][farmerId].value
          }
        );

      }
    });

    return harvestData;
  } catch (error) {
    console.error("Error fetching harvest data:", error);
    throw error;
  }
};

export const operatorCheck = async (role, email) => {
  try{
    const docRef = collection(db, role);
    const q = query(docRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {status: false, data: null};
    } else {
      return {status: true, data: querySnapshot.docs[0].data().fullName};
    }


  }
  catch (error) {
    console.error("Error fetching operator data:", error);
    throw error;
  }
}
