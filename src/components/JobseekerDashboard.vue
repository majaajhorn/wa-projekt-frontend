<template>
  <div>
    <h1>Welcome to the Jobseeker Dashboard</h1>
    <p>Here, jobseekers can manage their profile, browse jobs, and more.</p>
    <button @click="goToProfile">My Profile</button>
    <button @click="goToJobSearch">Job Search</button>
    <button v-if="isAuthenticated" @click="logOut">Log Out</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'JobseekerDashboard',
  data() {
    return {
      isAuthenticated: false,
    };
  },
  mounted() {
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token;
  },
  methods: {
    goToProfile() {
      this.$router.push('/my-profile');
    },
    goToJobSearch() {
      this.$router.push('/job-search');
    },
    logOut() {
      console.log('Logging out...');
      localStorage.removeItem('token');
      this.isAuthenticated = false;
      this.$router.replace('/');
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
  