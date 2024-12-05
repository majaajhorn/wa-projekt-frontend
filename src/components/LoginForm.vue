<script setup>
import { ref } from 'vue';
import { loginUser } from '../services/authService';

// Define reactive variables for email, password, role, and message
const email = ref('');
const password = ref('');
const role = ref('jobseeker'); // Default role
const message = ref('');

// Define the login function
const login = async () => {
  try {
    // Make the login request through authService
    const response = await loginUser({ email: email.value, password: password.value, role: role.value });
    message.value = response.data.message;

    // Save the token to localStorage for future API requests
    localStorage.setItem('token', response.data.token);

    // Redirect user to the appropriate dashboard based on the role
    if (role.value === 'jobseeker') {
      window.location.href = '/jobseeker-dashboard'; // Example: redirect to jobseeker dashboard
    } else {
      window.location.href = '/employer-dashboard'; // Example: redirect to employer dashboard
    }
  } catch (error) {
    // Display an error message if the login fails
    message.value = error.response?.data?.message || 'An error occurred.';
  }
};
</script>

<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="role">Log in as:</label>
        <select id="role" v-model="role" required>
          <option value="jobseeker">Jobseeker</option>
          <option value="employer">Employer</option>
        </select>
      </div>
      <div>
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="message">{{ message }}</p>

    <!-- Add the link to Register page -->
    <p>
      Don't have an account? <router-link to="/register">Go to Register</router-link>
    </p>
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
