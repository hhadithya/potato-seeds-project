import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = (dataSet) => {
  // console.log(dataSet.dataSet);
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', "August", "September", "October", "November", "December"],
    datasets: [
      {
        label: 'Harverst(Kg)',
        data: dataSet.dataSet,
        backgroundColor: 'rgba(255, 237, 213, 0.8)',
        borderColor: 'rgba(251, 146, 60,  1)',
        borderWidth: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Harvesting Data',
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10, // Smaller font size for x-axis labels
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 10, // Smaller font size for y-axis labels
          },
        },
      },
    },
  };

  return <Bar data={data} options={options}/>;
};

export default BarChart;