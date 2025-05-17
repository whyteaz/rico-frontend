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
  color: #2c3e50;
}

.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin-bottom: 15px;
}

.sidebar a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.sidebar a.router-link-exact-active {
  color: #42b983;
}

.sidebar li.disabled a {
  color: #aaa;
  cursor: not-allowed;
}

.content {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
