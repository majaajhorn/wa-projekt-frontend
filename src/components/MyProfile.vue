<template>
  <div>
    <h1>My Profile</h1>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="user.fullName">{{ user.fullName }}</p>
    <img v-if="user.profilePicture" :src="user.profilePicture" alt="Profile Picture" />
    <p v-else>Loading...</p>

    <form @submit.prevent="uploadProfilePicture">
      <label for="profilePicture">Upload Profile Picture:</label>
      <input type="file" id="profilePicture" ref="fileInput" />
      <button type="submit">Upload</button>
    </form>

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
    const fileInput = ref(null);
    const token = localStorage.getItem('token');
    const router = useRouter();

    const goBack = () => {
      router.back(); // Navigate back to the previous route
    };

    // Fetch user profile when the component is mounted
    onMounted(async () => {
      if (!token) {
        alert('You must be logged in to view this page.');
        router.push('/login'); // Redirect to login if no token
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

    // Upload profile picture
    const uploadProfilePicture = async () => {
      const file = fileInput.value?.files[0];
      if (!file) {
        alert('Please select a file to upload.');
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        const response = await apiClient.post('/auth/upload-profile-picture', formData, {
          headers: { 
            'Authorization': `Bearer ${token}`, // Corrected template literal for Bearer token
            'Content-Type': 'multipart/form-data', // Ensure correct content type
          },
        });
        user.value.profilePicture = response.data.profilePictureUrl; // Update picture in the UI
        alert('Profile picture uploaded successfully!');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Error uploading profile picture. Please try again.');
      }
    };

    return {
      user,
      goBack,
      errorMessage,
      fileInput,
      uploadProfilePicture,
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

img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 20px;
  object-fit: cover;
}
</style>
