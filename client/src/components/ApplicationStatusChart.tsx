import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { Application } from '../types/Application';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ApplicationStatusChartProps {
  applications: Application[];
}

const ApplicationStatusChart: React.FC<ApplicationStatusChartProps> = ({ applications }) => {
  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const data = {
    labels: ['Interested', 'Applying', 'Submitted', 'Accepted', 'Rejected'],
    datasets: [
      {
        label: '# of Applications',
        data: [
          statusCounts['Interested'] || 0,
          statusCounts['Applying'] || 0,
          statusCounts['Submitted'] || 0,
          statusCounts['Accepted'] || 0,
          statusCounts['Rejected'] || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Interested (primary color)
          'rgba(54, 162, 235, 0.6)', // Applying (a nice blue)
          'rgba(255, 206, 86, 0.6)', // Submitted (a light yellow)
          'rgba(153, 102, 255, 0.6)', // Accepted (a purple)
          'rgba(255, 99, 132, 0.6)', // Rejected (a red)
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        bodyFont: {
          family: "'Inter', sans-serif",
        },
      },
    },
  };

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <Pie data={data} options={options} />
    </div>
  );
};

export default ApplicationStatusChart;