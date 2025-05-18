<template>
  <div class="spending-dashboard-page">
    <header class="dashboard-header">
      <h1>Spending Dashboard</h1>
      <span class="financial-health">Financial Health: Good</span>
    </header>

    <main class="dashboard-grid">
      <!-- Net Worth Overview -->
      <section class="widget net-worth-overview">
        <div class="widget-header">
          <h2><font-awesome-icon :icon="['fas', 'wallet']" class="widget-icon" /> Net Worth Overview</h2>
          <p class="subtitle">Net Worth As of April 2025</p>
        </div>
        <div class="widget-content">
          <p class="total-net-worth">RM 75,000 Total Net Worth</p>
          <div class="chart-container" v-if="netWorthChartData.datasets.length">
            <Bar :data="netWorthChartData" :options="netWorthChartOptions" />
          </div>
        </div>
      </section>

      <!-- Monthly Spending -->
      <section class="widget monthly-spending">
        <div class="widget-header">
          <h2><font-awesome-icon :icon="['fas', 'chart-pie']" class="widget-icon" /> Monthly Spending</h2>
          <p class="subtitle">April 2025</p>
        </div>
        <div class="widget-content">
          <div class="chart-container" v-if="monthlySpendingChartData.datasets.length">
            <Doughnut :data="monthlySpendingChartData" :options="monthlySpendingChartOptions" />
          </div>
        </div>
      </section>

      <!-- Net Worth Trend -->
      <section class="widget net-worth-trend">
        <div class="widget-header">
          <h2><font-awesome-icon :icon="['fas', 'chart-line']" class="widget-icon" /> Net Worth Trend</h2>
          <p class="subtitle">Last 4 months</p>
        </div>
        <div class="widget-content">
          <div class="chart-container" v-if="netWorthTrendChartData.datasets.length">
            <Line :data="netWorthTrendChartData" :options="netWorthTrendChartOptions" />
          </div>
        </div>
      </section>

      <!-- Budget Status -->
      <section class="widget budget-status">
        <div class="widget-header">
          <h2><font-awesome-icon :icon="['fas', 'tasks']" class="widget-icon" /> Budget Status</h2>
          <p class="subtitle">Remaining for April</p>
        </div>
        <div class="widget-content">
          <div class="budget-item">
            <div class="budget-info">
              <span>Entertainment</span>
              <span>RM 250 / RM 300</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar entertainment" style="width: 83.33%;"></div>
            </div>
          </div>
          <div class="budget-item">
            <div class="budget-info">
              <span>Food</span>
              <span>RM 400 / RM 500</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar food" style="width: 80%;"></div>
            </div>
          </div>
          <div class="budget-item">
            <div class="budget-info">
              <span>Transport</span>
              <span>RM 150 / RM 200</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar transport" style="width: 75%;"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Bar, Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faWallet, faChartPie, faChartLine, faTasks } from '@fortawesome/free-solid-svg-icons';
// No need to call library.add() if icons are imported individually and used with FontAwesomeIcon component directly

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Chart Data and Options

// 1. Net Worth Overview (Horizontal Bar Chart)
const netWorthChartData = ref({
  labels: ['Net Worth'],
  datasets: [
    {
      label: 'Assets',
      backgroundColor: '#4CAF50', // Green
      data: [100000],
      borderRadius: 4,
      barThickness: 30,
    },
    {
      label: 'Liabilities',
      backgroundColor: '#F44336', // Red
      data: [25000],
      borderRadius: 4,
      barThickness: 30,
    },
  ],
});

const netWorthChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // For horizontal bar chart
  scales: {
    x: {
      stacked: false, // Bars side-by-side if multiple categories, but here we want them separate for Assets/Liabilities
      ticks: {
        color: '#A0A0A0',
        font: { size: 10 }
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      title: {
        display: true,
        text: 'Amount (RM)',
        color: '#E0E0E0',
        font: { size: 12, weight: 'bold' }
      }
    },
    y: {
      stacked: false,
      ticks: {
        color: '#A0A0A0',
        font: { size: 12 }
      },
      grid: {
        display: false, // Hide y-axis grid lines for cleaner look
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#E0E0E0',
        font: { size: 12 },
        boxWidth: 15,
        padding: 15
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: RM ${context.raw.toLocaleString()}`;
        }
      }
    },
  },
});


// 2. Monthly Spending (Donut Chart)
const monthlySpendingChartData = ref({
  labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Other'],
  datasets: [
    {
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      data: [30, 25, 15, 20, 10],
      hoverOffset: 8,
      borderColor: '#1E1E1E', // Match widget background for segment separation
      borderWidth: 2,
    },
  ],
});

const monthlySpendingChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%', // Adjust for donut thickness
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#E0E0E0',
        font: { size: 11 },
        boxWidth: 12,
        padding: 10,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      callbacks: {
        label: function(context) {
          return `${context.label}: ${context.raw}%`;
        }
      }
    },
  },
});

// 3. Net Worth Trend (Line Chart)
const netWorthTrendChartData = ref({
  labels: ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'],
  datasets: [
    {
      label: 'Assets',
      borderColor: '#4CAF50', // Green
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      data: [85000, 90000, 95000, 100000],
      tension: 0.3,
      fill: true,
      pointBackgroundColor: '#4CAF50',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#FFFFFF',
      pointHoverBorderColor: '#4CAF50',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Liabilities',
      borderColor: '#F44336', // Red
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      data: [30000, 28000, 26000, 25000],
      tension: 0.3,
      fill: true,
      pointBackgroundColor: '#F44336',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#FFFFFF',
      pointHoverBorderColor: '#F44336',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Net Worth',
      borderColor: '#2196F3', // Blue
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      data: [55000, 62000, 69000, 75000],
      tension: 0.3,
      fill: true,
      pointBackgroundColor: '#2196F3',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#FFFFFF',
      pointHoverBorderColor: '#2196F3',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
});

const netWorthTrendChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        color: '#A0A0A0',
        font: { size: 10 }
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
    },
    y: {
      ticks: {
        color: '#A0A0A0',
        font: { size: 10 },
        callback: function(value) {
          return 'RM ' + (value / 1000) + 'k';
        }
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
       title: {
        display: true,
        text: 'Amount (RM)',
        color: '#E0E0E0',
        font: { size: 12, weight: 'bold' }
      }
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#E0E0E0',
        font: { size: 12 },
        boxWidth: 15,
        padding: 15
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: RM ${context.raw.toLocaleString()}`;
        }
      }
    },
  },
});

</script>

<style scoped>
.spending-dashboard-page {
  background-color: #0D1117; /* GitHub Dark Dimmed Background */
  color: #C9D1D9; /* GitHub Dark Dimmed Primary Text */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  padding: 24px;
  min-height: 100vh;
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.dashboard-header h1 {
  font-size: 26px;
  font-weight: 600;
  color: #F0F6FC; /* GitHub Dark Dimmed Headings */
}

.financial-health {
  font-size: 14px;
  font-weight: 500;
  color: #58A6FF; /* GitHub Dark Dimmed Blue */
  background-color: rgba(56, 139, 253, 0.15); /* GitHub Dark Dimmed Blue subtle background */
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid rgba(56, 139, 253, 0.4);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.widget {
  background-color: #161B22; /* GitHub Dark Dimmed Card Background */
  border-radius: 8px;
  border: 1px solid #30363D; /* GitHub Dark Dimmed Border */
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  display: flex;
  flex-direction: column;
}

.widget-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #21262D; /* GitHub Dark Dimmed Divider */
}

.widget-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
}

.widget-icon {
  margin-right: 10px;
  color: #8B949E; /* GitHub Dark Dimmed Icon Color */
  font-size: 16px;
}

.widget-header .subtitle {
  font-size: 13px;
  color: #8B949E; /* GitHub Dark Dimmed Secondary Text */
  margin: 0;
}

.widget-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.widget-content p {
  font-size: 14px;
  line-height: 1.5;
  color: #C9D1D9;
}

.total-net-worth {
  font-size: 22px !important;
  font-weight: 600;
  color: #58A6FF !important; /* GitHub Blue */
  margin-bottom: 16px !important;
  text-align: left; /* As per screenshot */
}

.chart-container {
  flex-grow: 1;
  position: relative; /* Needed for chart.js responsiveness */
  min-height: 200px; /* Ensure charts have some space */
}
.monthly-spending .chart-container {
  min-height: 220px; /* Doughnut might need more space for legend */
}
.net-worth-trend .chart-container {
  min-height: 250px;
}


/* Budget Status Specific */
.budget-item {
  margin-bottom: 16px;
}
.budget-item:last-child {
  margin-bottom: 0;
}

.budget-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #C9D1D9;
  margin-bottom: 6px;
}
.budget-info span:last-child {
  color: #8B949E;
}

.progress-bar-container {
  background-color: #21262D; /* Darker track for progress bar */
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}
.progress-bar.entertainment { background-color: #A371F7; /* GitHub Purple */ }
.progress-bar.food { background-color: #58A6FF; /* GitHub Blue */ }
.progress-bar.transport { background-color: #F778BA; /* GitHub Pink */ }


/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr; /* Stack widgets on smaller screens */
  }
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .dashboard-header h1 {
    font-size: 22px;
  }
  .financial-health {
    font-size: 13px;
  }
  .widget-header h2 {
    font-size: 17px;
  }
   .total-net-worth {
    font-size: 20px !important;
  }
}

@media (max-width: 480px) {
  .spending-dashboard-page {
    padding: 16px;
  }
  .widget {
    padding: 16px;
  }
  .dashboard-header h1 {
    font-size: 20px;
  }
  .financial-health {
    padding: 5px 10px;
  }
  .monthly-spending .chart-container,
  .net-worth-trend .chart-container,
  .net-worth-overview .chart-container {
    min-height: 180px;
  }
}
</style>