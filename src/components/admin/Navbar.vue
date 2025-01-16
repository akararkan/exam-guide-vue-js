<template>
  <div class="navbar">
    <!-- Logo Section -->
    <div class="logo-container">
      <img src="@/assets/Logo.png" alt="Exam Guide Logo" class="logo" />
    </div>
    <!-- Navbar Links Section -->
    <div class="navbar-links">
      <router-link to="/admin/department" class="nav-link" exact-active-class="active-link">Department</router-link>
      <router-link to="/admin/courses" class="nav-link" exact-active-class="active-link">Courses</router-link>
      <router-link to="/admin/exam-hole" class="nav-link" exact-active-class="active-link">Exam Hole</router-link>
      <router-link to="/admin/exam-schedule" class="nav-link" exact-active-class="active-link">Exam Schedule</router-link>
      <router-link to="/admin/semester-schedule" class="nav-link" exact-active-class="active-link">Semester Schedule</router-link>
      <router-link to="/admin/users" class="nav-link" exact-active-class="active-link">Users</router-link>
    </div>
    <!-- Mobile Menu Toggle -->
    <div class="menu-toggle" @click="toggleMenu">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </div>
  </div>

  <!-- Mobile Menu (Conditional Display) -->
  <div :class="{ 'mobile-menu': true, open: isMobileMenuOpen }">
    <router-link to="/department" class="mobile-nav-link">Department</router-link>
    <router-link to="/courses" class="mobile-nav-link">Courses</router-link>
    <router-link to="/exam-hole" class="mobile-nav-link">Exam Hole</router-link>
    <router-link to="/exam-schedule" class="mobile-nav-link">Exam Schedule</router-link>
    <router-link to="/semester-schedule" class="mobile-nav-link">Semester Schedule</router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isMobileMenuOpen = ref(false);

const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<style scoped>
/* Navbar Container */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background-color: #34495e;
  color: white;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  height: 150px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo-container {
  flex: 0 0 auto;
}

.logo {
  max-width: 180px;
}

.navbar-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.6rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

/* Active link style */
.nav-link.router-link-active,
.nav-link.active-link {
  background-color: #16a085;
  transform: scale(1.05);
}

/* Hover effects for desktop links */
.nav-link:hover {
  background-color: #1abc9c;
  transform: scale(1.05);
}

.nav-link:active {
  background-color: #16a085;
}

/* Mobile Menu (Removed responsiveness, but kept the mobile menu structure) */
.menu-toggle {
  display: none;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: white;
  border-radius: 5px;
  margin: 5px 0;
}

/* Mobile Menu Styles (Not used but kept for future scalability) */
.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 1rem;
  background-color: #34495e;
  padding: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.mobile-menu.open {
  display: flex;
}

.mobile-nav-link {
  text-decoration: none;
  color: white;
  font-size: 1.5rem;
  padding: 1rem;
  border-bottom: 1px solid #1abc9c;
  transition: background-color 0.3s ease;
}

.mobile-nav-link:hover {
  background-color: #1abc9c;
}
</style>
