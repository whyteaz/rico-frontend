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
          <span class="finance-ai-badge">
            <font-awesome-icon :icon="['fas', 'award']" /> Finance-AI Trained
          </span>
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
import { library } from '@fortawesome/fontawesome-svg-core';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faAward);

const activeTab = ref('alerts'); // 'alerts', 'style', 'budgets'
const emailNotifications = ref(true); // Initial state based on screenshot (Alerts tab, Email toggle is on)
const inAppNotifications = ref(false); // Initial state based on screenshot (Alerts tab, In-App toggle is off)
const budgetWarningThreshold = ref(80); // Initial value for budget warning
const budgetCriticalThreshold = ref(95); // Initial value for budget critical
</script>

<style scoped>
:root {
  --app-bg: #161B22; /* GitHub dark dim default */
  --container-bg: #0D1117; /* GitHub dark dim darker */
  --card-bg: #22272E; /* Slightly lighter for cards */
  --text-primary: #C9D1D9; /* GitHub text primary */
  --text-secondary: #8B949E; /* GitHub text secondary */
  --accent-teal: #39D3BB; /* Teal accent */
  --accent-blue: #58A6FF; /* Blue accent (GitHub primary button) */
  --border-color: #30363D; /* GitHub border color */
  --input-bg: #0D1117; /* GitHub input background */
  --input-border: #30363D;
  --slider-track-bg: #30363D;
  --toggle-inactive-bg: #30363D;
  --toggle-handle-bg: #C9D1D9;
  --button-text-color: #FFFFFF;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
}

.settings-view {
  background-color: var(--app-bg);
  color: var(--text-primary);
  font-family: var(--font-family);
  padding: 24px 32px;
  min-height: 100vh;
}

.settings-view h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.tabs button {
  padding: 12px 18px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  margin-right: 8px;
  transition: color 0.2s ease, border-bottom-color 0.2s ease;
}

.tabs button.active {
  color: var(--accent-teal);
  border-bottom-color: var(--accent-teal);
  font-weight: 600;
}

.tabs button:not(.active):hover {
  color: var(--text-primary);
}

.tab-content {
  background-color: var(--container-bg);
  padding: 24px;
  border-radius: 8px;
  /* box-shadow: 0 4px 12px rgba(0,0,0,0.1); */
}

.tab-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item div:first-child { /* Text content container */
  margin-right: 16px;
}

.setting-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.setting-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Toggle Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 50px; /* Slightly smaller */
  height: 28px; /* Slightly smaller */
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
  background-color: var(--toggle-inactive-bg);
  transition: .3s;
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px; /* Smaller handle */
  width: 20px;  /* Smaller handle */
  left: 4px;
  bottom: 4px;
  background-color: var(--toggle-handle-bg);
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent-teal);
}

input:focus + .slider {
  box-shadow: 0 0 0 2px var(--app-bg), 0 0 0 4px var(--accent-teal); /* Focus ring */
}

input:checked + .slider:before {
  transform: translateX(22px); /* Adjusted for smaller size */
}

/* Style Tab Specifics */
.style-tab h2 { /* Sub-headings in style tab */
  font-size: 18px;
  margin-top: 24px; /* Space between sections */
}
.style-tab h2:first-of-type {
    margin-top: 0;
}


.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 350px; /* Limit width */
}
.slider-container span {
  font-size: 14px;
  color: var(--text-secondary);
}

.style-slider { /* Custom styling for range input */
  -webkit-appearance: none;
  appearance: none;
  width: 100%; /* Fill container */
  height: 8px;
  background: var(--slider-track-bg);
  border-radius: 8px;
  outline: none;
  cursor: pointer;
}

.style-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--accent-teal);
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid var(--container-bg); /* Creates a 'border' effect against the track */
}

.style-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--accent-teal);
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid var(--container-bg);
}

/* This is a trick to color the left side of the slider track.
   It requires the v-model to be bound and updated.
   For now, this is a visual placeholder.
   A more robust solution would involve a custom component or JS. */
/* input[type="range"] {
  background: linear-gradient(to right, var(--accent-teal) 0%, var(--accent-teal) 50%, var(--slider-track-bg) 50%, var(--slider-track-bg) 100%);
} */


.tone-style-list {
  list-style: none;
  padding-left: 0;
  margin-bottom: 20px;
}

.tone-style-list li {
  margin-bottom: 10px;
  line-height: 1.6;
  font-size: 14px;
  color: var(--text-secondary);
  padding-left: 20px;
  position: relative;
}
.tone-style-list li::before {
  content: "•";
  color: var(--accent-teal);
  font-weight: bold;
  display: inline-block;
  position: absolute;
  left: 0;
  top: 0;
}


.about-rico p {
  line-height: 1.6;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.finance-ai-badge {
  display: inline-flex; /* Use flex for icon alignment */
  align-items: center;
  gap: 6px; /* Space between icon and text */
  background-color: var(--accent-teal);
  color: var(--container-bg); /* Dark text on light badge */
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}
.finance-ai-badge .svg-inline--fa {
  font-size: 14px;
}


/* Budgets Tab Specific Styles */
.budgets-tab .setting-item {
  align-items: flex-start; /* Align items to top for multi-line descriptions */
}
.budgets-tab .setting-item > div:first-child {
  flex-grow: 1;
}


.input-with-symbol {
  display: flex;
  align-items: center;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: 0 12px;
  height: 40px;
}

.input-with-symbol input[type="number"] {
  background-color: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  padding: 8px 0px 8px 5px;
  width: 50px;
  text-align: right;
  font-size: 15px;
  -moz-appearance: textfield;
}

.input-with-symbol input[type="number"]::-webkit-outer-spin-button,
.input-with-symbol input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-with-symbol span {
  font-size: 15px;
  color: var(--text-secondary);
  padding-left: 6px;
}
.input-with-symbol input[type="number"]:focus-within, .input-with-symbol:focus-within {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 2px var(--app-bg), 0 0 0 4px var(--accent-blue);
}


.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.save-button {
  background-color: var(--accent-blue);
  color: var(--button-text-color);
  border: 1px solid var(--accent-blue);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.save-button:hover {
  background-color: #4092EE; /* Slightly lighter blue for hover */
  border-color: #4092EE;
}
.save-button:active {
  background-color: #2F79D6; /* Slightly darker blue for active */
  border-color: #2F79D6;
}

</style>