<template>
  <div class="login-container">
    <div class="login-box">
      <!-- App Logo -->
      <div class="logo-container">
        <img src="@/assets/Logo.png" alt="Exam Guide Logo" class="logo" />
      </div>
      
      <!-- Login Form -->
      <h1>Login to Exam Guide</h1>
      <form @submit.prevent="login">
        <div class="input-group">
          <label for="email">Email:</label>
          <input v-model="user.email" type="email" id="email" placeholder="Enter your email" required />
        </div>
        <div class="input-group">
          <label for="password">Password:</label>
          <input v-model="user.password" type="password" id="password" placeholder="Enter your password" required />
        </div>
        <button type="submit" :disabled="!user.email || !user.password">Login</button>
      </form>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      
      <!-- Footer -->
      <div class="footer">
        <p>&copy; 2024 Exam Guide. All Rights Reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const user = ref({
  email: '',
  password: ''
});

const errorMessage = ref(null);

const login = async () => {
  try {
    const response = await axios.post('http://localhost:8081/api/v1/user/login', user.value);
    const token = response.data.token;

    // Decode JWT token
    const decodedToken = jwtDecode(token);

    // Store token in localStorage
    localStorage.setItem('authToken', token);

    console.log('Logged in user:', decodedToken);

    // Check user role and redirect accordingly
    const userRole = decodedToken.ROLE;

    if (userRole === 'ADMIN') {
      window.location.href = '/admin/department';
    } else if (userRole === 'COMMITTEE') {
      window.location.href = '/committee';
    } else {
      errorMessage.value = 'User role not recognized.';
    }
  } catch (error) {
    errorMessage.value = 'Login failed. Please check your credentials.';
    console.error('Login error:', error);
  }
};
</script>

<style scoped>
/* General container styling */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1abc9c, #16a085); /* Custom gradient background */
  font-family: 'Roboto', sans-serif;
  background-size: cover;
  background-position: center;
}

/* Login box styling */
.login-box {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 360px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

/* Hover effect for login box */
.login-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

/* App logo styling */
.logo-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.logo {
  width: 120px;
  height: auto;
}

/* Header styling */
h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 30px;
  font-weight: bold;
}

/* Input group styling */
.input-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
}

/* Input field styling */
input {
  width: 100%;
  padding: 14px;
  margin-bottom: 5px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Focus effect for inputs */
input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.2);
}

/* Button styling */
button {
  width: 100%;
  padding: 14px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:disabled {
  background-color: #a0c4e5;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
  transform: scale(1.02);
}

button:active:not(:disabled) {
  background-color: #2471a3;
}

/* Error message styling */
.error {
  color: red;
  margin-top: 15px;
  font-size: 0.9rem;
}

/* Footer */
.footer {
  margin-top: 30px;
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Mobile responsive design */
@media (max-width: 400px) {
  .login-box {
    width: 100%;
    padding: 30px;
    margin: 0 20px;
  }

  h1 {
    font-size: 2rem;
  }

  button {
    font-size: 1rem;
  }
}
</style>
