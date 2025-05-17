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
          <h2>Net Worth Overview</h2>
          <p class="subtitle">Net Worth As of April 2025</p>
        </div>
        <div class="widget-content">
          <p class="total-net-worth">RM 75,000 Total Net Worth</p>
          <div class="chart-placeholder">
            <p>[Horizontal Bar Chart: Assets (e.g., RM 100,000) vs Liabilities (e.g., RM 25,000)]</p>
          </div>
        </div>
      </section>

      <!-- Monthly Spending -->
      <section class="widget monthly-spending">
        <div class="widget-header">
          <h2>Monthly Spending</h2>
          <p class="subtitle">April 2025</p>
        </div>
        <div class="widget-content">
          <div class="chart-placeholder">
            <p>[Donut Chart: Housing (30%), Food (25%), Transport (15%), Entertainment (20%), Other (10%)]</p>
          </div>
        </div>
      </section>

      <!-- Net Worth Trend -->
      <section class="widget net-worth-trend">
        <div class="widget-header">
          <h2>Net Worth Trend</h2>
          <p class="subtitle">Last 4 months</p>
        </div>
        <div class="widget-content">
          <div class="chart-placeholder">
            <p>[Line Chart: Assets, Liabilities, Net Worth trends over Jan, Feb, Mar, Apr 2025]</p>
          </div>
        </div>
      </section>

      <!-- Budget Status -->
      <section class="widget budget-status">
        <div class="widget-header">
          <h2>Budget Status</h2>
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

      <!-- Personalized Insights -->
      <section class="widget personalized-insights">
        <div class="widget-header">
          <h2>Personalized Insights <span class="ai-badge">Finance-AI Trained</span></h2>
        </div>
        <div class="widget-content">
          <p class="insight-text">You might want to reduce transport spending 🔥</p>
          <div class="actions">
            <button class="btn btn-primary">Set transport budget</button>
            <button class="btn btn-secondary">View saving tips</button>
          </div>
        </div>
      </section>

      <!-- Trend Analysis -->
      <section class="widget trend-analysis">
        <div class="widget-header">
          <h2>Trend Analysis <span class="ai-badge">Finance-AI Trained</span></h2>
        </div>
        <div class="widget-content">
          <p>Your assets have grown 9.1% this quarter, outpacing your liabilities at 6.3% reduction.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
// No script logic needed for this static UI implementation.
// Vue Composition API setup is used as preferred.
</script>

<style scoped>
.spending-dashboard-page {
  background-color: #121212; /* Very dark gray page background */
  color: #E0E0E0; /* Light gray primary text */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 20px;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF; /* White title */
}

.financial-health {
  font-size: 16px;
  font-weight: 500;
  color: #4CAF50; /* Green for 'Good' */
  background-color: rgba(76, 175, 80, 0.1);
  padding: 8px 15px;
  border-radius: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.widget {
  background-color: #1E1E1E; /* Dark gray widget background */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.widget-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #333333;
  padding-bottom: 10px;
}

.widget-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.widget-header .subtitle {
  font-size: 14px;
  color: #A0A0A0; /* Medium gray subtitle */
  margin: 0;
}

.widget-content {
  flex-grow: 1;
}

.widget-content p {
  font-size: 15px;
  line-height: 1.6;
  color: #C0C0C0; /* Lighter gray for content text */
}

.total-net-worth {
  font-size: 24px !important;
  font-weight: 700;
  color: #4CAF50 !important; /* Green for net worth value */
  margin-bottom: 15px !important;
  text-align: center;
}

.chart-placeholder {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #A0A0A0;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
}

/* Specific Widget Styling */
.net-worth-overview .widget-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.budget-item {
  margin-bottom: 15px;
}
.budget-item:last-child {
  margin-bottom: 0;
}

.budget-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #D0D0D0;
  margin-bottom: 5px;
}

.progress-bar-container {
  background-color: #333333; /* Darker track for progress bar */
  border-radius: 5px;
  height: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 5px;
}
.progress-bar.entertainment { background-color: #FF9800; /* Orange */ }
.progress-bar.food { background-color: #2196F3; /* Blue */ }
.progress-bar.transport { background-color: #9C27B0; /* Purple */ }

.ai-badge {
  font-size: 12px;
  font-weight: 500;
  color: #FFFFFF;
  background-color: #007AFF; /* Blue badge */
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: 10px;
  display: inline-block;
  vertical-align: middle;
}
.personalized-insights .widget-header h2,
.trend-analysis .widget-header h2 {
  justify-content: flex-start; /* Align badge next to title */
}


.personalized-insights .insight-text {
  font-size: 16px;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: auto; /* Pushes buttons to the bottom if widget has extra space */
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background-color: #007AFF; /* Blue primary button */
  color: white;
}
.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #3A3A3C; /* Dark gray secondary button */
  color: #E0E0E0;
  border: 1px solid #545458;
}
.btn-secondary:hover {
  background-color: #4A4A4C;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr; /* Stack widgets on smaller screens */
  }
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .dashboard-header h1 {
    font-size: 24px;
  }
  .financial-health {
    font-size: 14px;
  }
  .actions {
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
}
</style>