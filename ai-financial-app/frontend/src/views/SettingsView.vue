<template>
  <div class="settings-view">
    <h1>Settings</h1>

    <div class="tabs">
      <button @click="activeTab = 'alerts'" :class="{ active: activeTab === 'alerts' }">Alerts</button>
      <button @click="activeTab = 'style'" :class="{ active: activeTab === 'style' }">Rico's Style</button>
      <button @click="activeTab = 'budgets'" :class="{ active: activeTab === 'budgets' }">Budgets</button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'alerts'" class="alerts-tab">
        <h2>Notification Settings</h2>
        <div class="setting-item">
          <div>
            <p class="setting-title">Email Notifications</p>
            <p class="setting-description">Receive budget alerts via email</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="emailNotifications">
            <span class="slider round"></span>
          </label>
        </div>
        <div class="setting-item">
          <div>
            <p class="setting-title">In-App Notifications</p>
            <p class="setting-description">Receive alerts in the chat</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="inAppNotifications">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <div v-if="activeTab === 'style'" class="style-tab">
        <h2>Rico's Personality</h2>
        <div class="setting-item">
          <div>
            <p class="setting-title">Conversation Style</p>
          </div>
          <div class="slider-container">
            <span>Professional</span>
            <input type="range" min="0" max="100" value="50" class="style-slider">
            <span>Friendly</span>
          </div>
        </div>

        <h2>Rico's Tone & Style</h2>
        <ul class="tone-style-list">
          <li>Friendly: Casual, like a buddy texting you — uses emojis, playful wording</li>
          <li>Smart: Financially accurate, but never overly formal</li>
          <li>Curious: Asks questions naturally, encourages interaction</li>
          <li>Reassuring: Eases stress around money, gives praise and guidance</li>
          <li>Compact: Short, punchy messages in chat-style format</li>
        </ul>

        <h2>About Rico</h2>
        <div class="about-rico">
          <p>Rico is your personal AI finance assistant, designed to make managing your money simple and stress-free. Trained on a vast dataset of financial information, Rico can help you understand your spending, track your budgets, and achieve your financial goals. Rico learns your preferences over time to provide tailored advice and insights.</p>
          <span class="finance-ai-badge">Finance-AI Trained</span>
        </div>
      </div>

      <div v-if="activeTab === 'budgets'" class="budgets-tab">
        <h2>Budget Thresholds</h2>
        <div class="setting-item">
          <div>
            <p class="setting-title">Warning at</p>
            <p class="setting-description">Get a warning when spending reaches this percentage of a budget.</p>
          </div>
          <div class="input-with-symbol">
            <input type="number" v-model="budgetWarningThreshold" placeholder="80">
            <span>%</span>
          </div>
        </div>
        <div class="setting-item">
          <div>
            <p class="setting-title">Critical at</p>
            <p class="setting-description">Get a critical alert when spending reaches this percentage of a budget.</p>
          </div>
          <div class="input-with-symbol">
            <input type="number" v-model="budgetCriticalThreshold" placeholder="95">
            <span>%</span>
          </div>
        </div>
        <div class="actions-row">
          <button class="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref('alerts'); // 'alerts', 'style', 'budgets'
const emailNotifications = ref(false); // Initial state for the toggle
const inAppNotifications = ref(false); // Initial state for the toggle
const budgetWarningThreshold = ref(80); // Initial value for budget warning
const budgetCriticalThreshold = ref(95); // Initial value for budget critical
</script>

<style scoped>
/* Basic styling for tabs and content */
.settings-view {
  padding: 20px;
  font-family: sans-serif; /* Basic font */
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
}

.tabs button {
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  font-size: 16px;
  border-bottom: 3px solid transparent; /* For active indicator */
  margin-bottom: -1px; /* Align with parent border */
}

.tabs button.active {
  border-bottom-color: #007bff; /* Example active color */
  font-weight: bold;
}

.tabs button:not(.active):hover {
  background-color: #f0f0f0;
}

.tab-content h2 {
  margin-top: 0;
  font-size: 20px;
  margin-bottom: 20px;
}

.setting-item { /* Generalize for all tabs */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item .setting-title {
  font-weight: bold;
  margin: 0 0 5px 0;
}

.setting-item .setting-description {
  font-size: 0.9em;
  color: #555;
  margin: 0;
}

.style-tab h2 {
  margin-top: 30px; /* Add some space above new section titles */
  margin-bottom: 15px;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.style-tab .setting-item .setting-title {
  margin-bottom: 10px; /* More space for the slider section title */
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.style-slider {
  width: 200px; /* Adjust as needed */
  cursor: pointer;
}

.tone-style-list {
  list-style: disc;
  padding-left: 20px;
  margin-bottom: 20px;
}

.tone-style-list li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.about-rico p {
  line-height: 1.6;
  margin-bottom: 15px;
}

.finance-ai-badge {
  display: inline-block;
  background-color: #e0f2fe; /* Light blue background */
  color: #0c5464; /* Dark blue text */
  padding: 5px 10px;
  border-radius: 15px; /* Pill shape */
  font-size: 0.9em;
  font-weight: bold;
}


/* Basic Toggle Switch CSS */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3; /* Example toggle active color */
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Budgets Tab Specific Styles */
.budgets-tab h2 {
  margin-top: 0; /* Already handled by .tab-content h2 */
  margin-bottom: 20px;
  font-size: 18px; /* Consistent with other sub-section titles like in style-tab */
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.input-with-symbol {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 10px;
}

.input-with-symbol input[type="number"] {
  border: none;
  outline: none;
  padding: 8px 5px;
  width: 60px; /* Adjust as needed */
  text-align: right;
  font-size: 16px;
  -moz-appearance: textfield; /* Firefox */
}

.input-with-symbol input[type="number"]::-webkit-outer-spin-button,
.input-with-symbol input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-with-symbol span {
  font-size: 16px;
  color: #555;
  padding-left: 5px;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.save-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.save-button:hover {
  background-color: #0056b3;
}

</style>