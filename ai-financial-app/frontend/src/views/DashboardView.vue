<template>
  <div class="dashboard-view">
    <h1>Financial Dashboard</h1>
    <div v-if="error" class="error-message">
      <p>Error fetching dashboard data: {{ error }}</p>
      <p>Please ensure a PDF has been processed successfully before viewing the dashboard.</p>
    </div>
    <div v-if="dashboardData && !error">
      <h2>Summary</h2>
      <p>Total Income: {{ dashboardData.totalIncome }} {{ dashboardData.currency }}</p>
      <p>Total Expenses: {{ dashboardData.totalExpenses }} {{ dashboardData.currency }}</p>
      
      <h2>Income vs. Expenses</h2>
      <div class="chart-container">
        <Bar v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
      </div>
    </div>
    <div v-if="loading && !error">
      <p>Loading dashboard data...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { Bar } from 'vue-chartjs';
import { getDashboardData } from '../services/api'; // Import the API service function
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const dashboardData = ref(null);
const error = ref(null);
const loading = ref(true);

const chartData = reactive({
  labels: [],
  datasets: [
    {
      label: 'Amount',
      backgroundColor: ['#4CAF50', '#F44336'], // Green for income, Red for expenses
      data: []
    }
  ]
});

const chartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false
});

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;
  try {
    // const response = await fetch('/api/dashboard-data'); // Old fetch call
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    // }
    // const data = await response.json();
    
    const response = await getDashboardData(); // Use API service
    const data = response.data; // Axios wraps response in .data
    dashboardData.value = data;

    // Update chart data
    chartData.labels = ['Income', 'Expenses'];
    chartData.datasets[0].data = [data.totalIncome, data.totalExpenses];
    
  } catch (e) {
    console.error('Failed to fetch dashboard data:', e);
    if (e.response && e.response.data && e.response.data.message) {
      error.value = e.response.data.message;
    } else if (e.message) {
      error.value = e.message;
    } else {
      error.value = 'An unknown error occurred while fetching dashboard data.';
    }
    // Clear previous data if error
    dashboardData.value = null;
    chartData.labels = [];
    chartData.datasets[0].data = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.error-message {
  color: red;
  border: 1px solid red;
  padding: 10px;
  margin-bottom: 20px;
}

.chart-container {
  position: relative;
  height: 400px; /* Adjust as needed */
  width: 100%;
  margin-top: 20px;
}

h1, h2 {
  color: #333;
}
p {
  color: #555;
  line-height: 1.6;
}
</style>