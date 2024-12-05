<template>
    <div>
      <h1>Welcome to the Jobseeker Dashboard</h1>
      <p>Here, jobseekers can manage their profile, browse jobs, and more.</p>
      <button @click="goToProfile">My Profile</button>
      <!-- Show the logout button only if the user is authenticated -->
    <button v-if="isAuthenticated" @click="logOut">Log Out</button>
    </div>
  </template>
  
  <script>
import { useRouter } from 'vue-router';

export default {
  name: 'JobseekerDashboard',
  data() {
    return {
      isAuthenticated: false, // Default to false; will be updated based on token
    };
  },
  mounted() {
    // Check if the user is authenticated (i.e., token exists in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated = true; // Set authentication state to true if token exists
    }
  },
  methods: {
    goToProfile() {
      this.$router.push('/my-profile'); // Navigate to the profile page
    },
    logOut() {
      // Handle logout process
      console.log('Logging out...');
      localStorage.removeItem('token'); // Clear the token from localStorage
      console.log('Token removed');
      this.isAuthenticated = false; // Update the authentication state
      this.$router.replace('/'); // Redirect to the home page
      alert('Logged out successfully!');
    },
  },
};
</script>
  
  <style scoped>
  button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #42b883;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
  background-color: #389a6e;
}
</style>
  