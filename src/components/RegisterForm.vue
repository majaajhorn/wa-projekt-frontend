<script setup>
import { ref } from 'vue';
import { registerUser } from '../services/authService';

// Define reactive variables for full name, email, password, role, and message
const fullName = ref('');
const email = ref('');
const password = ref('');
const role = ref('jobseeker'); // Default role
const message = ref('');

// Define the register function
const register = async () => {
  try {
    // Make the register request through authService
    const response = await registerUser({
      fullName: fullName.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });

    // Display the success message
    message.value = response.data.message;
  } catch (error) {
    // Display an error message if registration fails
    message.value = error.response?.data?.message || 'An error occurred.';
  }
};
</script>

<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="register">
      <div>
        <label for="fullName">Full Name:</label>
        <input id="fullName" v-model="fullName" type="text" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <div>
        <label for="role">I’m registering as:</label>
        <select id="role" v-model="role" required>
          <option value="jobseeker">Jobseeker</option>
          <option value="employer">Employer</option>
        </select>
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
