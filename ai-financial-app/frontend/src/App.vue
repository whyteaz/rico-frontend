<template>
  <div id="app">
    <nav class="sidebar">
      <ul>
        <li><router-link to="/">Chat</router-link></li>
        <li><router-link to="/dashboard">Dashboard</router-link></li>
        <li><router-link to="/settings">Settings</router-link></li>
        <!-- Placeholders for Transactions and Insights as per PLAN.md -->
        <li class="disabled"><a href="#">Transactions (MVP omit)</a></li>
        <li class="disabled"><a href="#">Insights (MVP omit)</a></li>
      </ul>
    </nav>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// No script needed for this basic layout
</script>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #1A1D21; /* Main Background for the entire app */
  color: #E2E8F0; /* Default light text color for the app */
}

.sidebar {
  width: 260px; /* Adjusted width to match ChatView's original sidebar */
  background-color: #1A1D21; /* Sidebar background */
  padding: 20px;
  border-right: 1px solid #2D3748; /* Separator */
  display: flex;
  flex-direction: column;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin-bottom: 8px; /* Adjusted margin */
}

.sidebar a {
  display: flex; /* To align icon and text if icons are added later */
  align-items: center;
  padding: 12px 15px;
  border-radius: 8px;
  text-decoration: none;
  color: #A0AEC0; /* Lighter gray for nav items */
  font-weight: 500; /* Adjusted font-weight */
  transition: background-color 0.2s, color 0.2s;
}

.sidebar a:hover {
  background-color: #2D3748; /* Slightly lighter dark gray */
  color: #E2E8F0;
}

.sidebar a.router-link-exact-active {
  background-color: #14B8A6; /* Teal/Cyan accent */
  color: #0F172A; /* Darker text for active item */
  font-weight: bold; /* Keep active link bold */
}

.sidebar li.disabled a {
  color: #aaa;
  cursor: not-allowed;
}

.content {
  flex-grow: 1;
  /* padding: 20px; */ /* Padding will be handled by the view's container */
  overflow-y: auto;
  background-color: #1A1D21; /* Ensure content area also has dark background */
}
</style>
