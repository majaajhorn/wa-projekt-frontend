<template>
  <div>
    <h1>My Profile</h1>

    <!-- Display Error Messages -->
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <!-- Display User Info -->
    <div v-if="user">
      <p><strong>Name:</strong> {{ user.fullName }}</p>
      <p><strong>Email:</strong> <span>{{ user.email }}</span></p>

      <button @click="editEmail = !editEmail">Change Email</button>
      <button @click="editPassword = !editPassword">Change Password</button>

      <!-- Edit Email Form -->
      <div v-if="editEmail">
        <input v-model="updatedEmail" type="email" placeholder="Enter new email" />
        <button @click="updateEmail">Save Email</button>
      </div>

      <!-- Edit Password Form -->
      <div v-if="editPassword">
        <input v-model="currentPassword" type="password" placeholder="Current password" />
        <input v-model="newPassword" type="password" placeholder="New password" />
        <button @click="updatePassword">Save Password</button>
      </div>
    </div>

    <!-- Profile Picture -->
    <img v-if="user.profilePicture" :src="user.profilePicture" alt="Profile Picture" />
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
    const updatedEmail = ref('');
    const currentPassword = ref('');
    const newPassword = ref('');
    const errorMessage = ref('');
    const fileInput = ref(null);
    const token = localStorage.getItem('token');
    const router = useRouter();
    const editEmail = ref(false);
    const editPassword = ref(false);

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
        updatedEmail.value = response.data.email;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        errorMessage.value = 'Error fetching profile, please try again later.';
      }
    });

    // Function to update email
    const updateEmail = async () => {
      try {
        const payload = {
          email: updatedEmail.value,
        };

        const response = await apiClient.put('/auth/update-profile', payload);
        alert('Email updated successfully!');
        console.log(response.data);
        user.value.email = updatedEmail.value; // Update email in the UI
        editEmail.value = false; // Hide email input field after save
      } catch (error) {
        console.error('Error updating email:', error);
        alert('Error updating email. Please try again.');
      }
    };

    // Function to update password
    const updatePassword = async () => {
      if (!currentPassword.value || !newPassword.value) {
        alert('Please fill in both the current and new password fields.');
        return;
      }

      try {
        const payload = {
          currentPassword: currentPassword.value,
          newPassword: newPassword.value,
        };

        const response = await apiClient.put('/auth/update-profile', payload);
        alert('Password updated successfully!');
        console.log(response.data);
        currentPassword.value = ''; // Clear password fields
        newPassword.value = '';
        editPassword.value = false; // Hide password input fields after save
      } catch (error) {
        console.error('Error updating password:', error);
        alert('Error updating password. Please try again.');
      }
    };

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
      updatedEmail,
      currentPassword,
      newPassword,
      goBack,
      errorMessage,
      fileInput,
      editEmail,
      editPassword,
      updateEmail,
      updatePassword,
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

input {
  margin: 10px 0;
  padding: 5px;
  width: 200px;
}
</style>
