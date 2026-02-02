import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StudentProgressChart({ labels = [], dataPoints = [], title = "پروگریس (گزشتہ ماہ)" }) {
  const data = {
    labels,
    datasets: [
      {
        label: "مجموعی پارے",
        data: dataPoints,
        borderColor: "#0b4d6c",
        backgroundColor: "rgba(11,77,108,0.12)",
        tension: 0.3,
        fill: true,
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title }
    },
    scales: {
      x: { ticks: { color: "#0f172a" } },
      y: { ticks: { color: "#0f172a" }, beginAtZero: true }
    }
  };

  return (
    <div className="card">
      <Line data={data} options={options} />
    </div>
  );
}