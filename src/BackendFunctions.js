// const backendURL = 'https://soursop-backend.vercel.app';
const backendURL = 'http://192.168.1.76:5000';

export const tokenGen = async () => {
    try {
        const response = await fetch(`${backendURL}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error generating token: ', error);
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
        const result = await responce.json();
        console.log(result);
    } catch (error) {
        console.error('Error sending mail: ', error);
    }
};

export const sendRole = async ({ role }) => {
    try {
        const response = await fetch(`${backendURL}/api/send-role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                role: role,
            }),
        });
        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error sending role: ', error);
    }
};

export const getRole = async () => {
    try {
        const response = await fetch(`${backendURL}/api/get-role`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error getting role: ', error);
    }
};