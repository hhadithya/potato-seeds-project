import { ref, get } from 'firebase/database';
import { realTimeDB } from '../firebase/firebaseConfig';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'; 

// Dashboard stats
export const getHarvestData = async ({filterSection}) => {
  console.log(filterSection);
  try {
    // Initialize Firebase database reference
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = currentDate.getDate().toString().padStart(2, '0');
    const basePath = `${filterSection}/${currentYear}/${currentMonth}`;

    // Initialize results
    let totalHarvestThisMonth = 0;
    let totalHarvestThisYear = 0;
    let totalHarvestPerMonth = new Array(12).fill(0);
    let farmerTopYear = {};
    let farmerTopMonth = {};
    let topFarmerThisMonth = null;
    let maxHarvestThisMonth = 0;
    let totalHarvestThisDay = 0;

    // Get the month data
    const monthRef = ref(realTimeDB, basePath);
    const snapshot = await get(monthRef);

    if (snapshot.exists()) {
      const monthData = snapshot.val();
      console.log("monthData:", monthData);

      // Loop through each day in the month
      for (const day in monthData) {
        const dayData = monthData[day];
        // console.log("dayData:", dayData);

        for(const id in dayData){
          const idData = dayData[id];

        // Loop through each time key under the day
          for (const timeKey in idData) {
            const harvestValue = idData[timeKey];

            if (day === currentDay) {
              totalHarvestThisDay += harvestValue;
            }
            // console.log(timeKey);
            // Accumulate monthly total
            totalHarvestThisMonth += harvestValue;

            if (!farmerTopMonth[id]) farmerTopMonth[id] = 0;
            farmerTopMonth[id] += harvestValue;

            if (farmerTopMonth[id] > maxHarvestThisMonth) {
              maxHarvestThisMonth = farmerTopMonth[id];
              topFarmerThisMonth = id;
            }
          }
        }
      }
    }

    // Calculate yearly total and per-month totals
    const yearRef = ref(realTimeDB, `${filterSection}/${currentYear}`);
    const yearSnapshot = await get(yearRef);

    if (yearSnapshot.exists()) {
      const yearData = yearSnapshot.val();

      for (const month in yearData) {
        const monthIndex = parseInt(month, 10) - 1; // Convert to 0-based index
        const monthDetails = yearData[month];

        for (const day in monthDetails) {
          const dayDetails = monthDetails[day];

          for (const id in dayDetails) {
            const idDetails = dayDetails[id];

            for (const timeKey in idDetails) {
              const harvestValue = idDetails[timeKey] || 0;

              // Accumulate yearly total
              totalHarvestThisYear += harvestValue;

              // Accumulate per-month totals
              totalHarvestPerMonth[monthIndex] += harvestValue;

              if (!farmerTopYear[id]) farmerTopYear[id] = 0;
              farmerTopYear[id] += harvestValue;
            }
          }
        }
      }
    }

    return {
      totalHarvestThisYear,       // Total harvest for the year
      totalHarvestThisMonth,      // Total harvest for the current month
      totalHarvestThisDay,        // Total harvest for the current day
      totalHarvestPerMonth,       // Array of total harvests for each month
      farmerTopYear,              // Object of total harvests per farmer for the year
      topFarmerThisMonth,         // Key of the farmer with the max harvest this month
      maxHarvestThisMonth         // Maximum harvest value for the current month
    };
  } catch (error) {
    console.error("Error fetching harvest data:", error);
    throw error;
  }
};

export const farmerHarvestDetails = async ({id, dateFrom, dateTo, operatorSection}) => {
  const farmerDocRef = doc(db, "farmers", id);
  const farmerDoc = await getDoc(farmerDocRef);
  console.log(operatorSection.toLowerCase() +"dates");
  const inDates = farmerDoc.data()[operatorSection.toLowerCase() +"-dates"];
  console.log("inDates:", inDates);

  const filteredDates = inDates.filter((date) => {
    date = date.replaceAll("/", "-");
    console.log("date:", date);
    return date >= dateFrom && date <= dateTo;
  });
  try{
    const farmerHarvest = [];
    const sectionData = operatorSection;
    for (let date of filteredDates) {
      const dateRef = ref(realTimeDB, `${sectionData}/${date}/${id}`);
      const snapshot = await get(dateRef);
      const data = snapshot.val();
      console.log("data:", data);

      if(data){
        Object.entries(data).forEach(([time, harvest]) => {
          farmerHarvest.push({
            date,
            time,
            value: harvest
          });
        });
      }
    }
    console.log("farmerHarvest:", farmerHarvest);
    return farmerHarvest;
  } catch (error) {
    console.error("Error fetching farmer harvest details:", error);
  }
}


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

