<template>
    <div>
      <!-- Include Navbar Component -->
      <Navbar />
      
      <!-- Admin Page Content -->
      <div class="admin-content">
        <router-view></router-view>  <!-- This will display the current route's component -->
      </div>
    </div>
  </template>
  
  <script setup>
  import Navbar from './Navbar.vue';
  </script>
  
  <style scoped>
  .admin-content {
    margin-top: 150px;  /* Adjust for navbar height if needed */
    padding: 20px;
  }
  </style>
  