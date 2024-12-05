<template>
  <div>
    <h1>My Profile</h1>
    <p v-if="errorMessage">{{ errorMessage }}</p>
      <!-- Display user data if available -->
      <p v-else-if="user.fullName">Welcome, {{ user.fullName }}</p>
    <!-- Fallback message if no data is loaded yet -->
    <p v-else>Loading...</p>
    <button @click="goBack">Go Back</button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/axios.js';

export default {
  name: 'MyProfile',
  setup() {
    const user = ref({});
    const errorMessage = ref('');
    //const fullName = ref('');
    const token = localStorage.getItem('token');
    const router = useRouter();

    const goBack = () => {
      router.back(); // Navigate back to the previous route
    };

    // Fetch user profile when the component is mounted
    onMounted(async () => {
      if (!token) {
        alert('You must be logged in to view this page.');
        return;
      }

      try {
        const response = await apiClient.get('/auth/profile');
        console.log('Profile fetched successfully:', response.data);
        user.value = response.data; // Update user profile with the response
      } catch (error) {
        console.error('Error fetching user profile:', error);
        errorMessage.value = 'Error fetching profile, please try again later.';
      }
    });

    return {
      user,
      goBack,
      errorMessage,
    };
  },
};
</script>

<style scoped>
button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
