<template>
  <div>
    <h1>My Profile</h1>

    <!-- Profile Picture Section -->
    <img v-if="user.profilePicture" :src="user.profilePicture" alt="Profile Picture" />
    <form @submit.prevent="uploadProfilePicture">
      <label for="profilePicture">Upload Profile Picture:</label>
      <input type="file" id="profilePicture" ref="fileInput" />
      <button type="submit">Upload</button>
    </form>

    <!-- Display User Info -->
    <div v-if="user">
      <!-- Buttons to change email and password -->
      <button @click="editEmail = !editEmail">Change Email</button>
      <button @click="editPassword = !editPassword">Change Password</button>
    </div>

    <!-- Complete Profile Section -->
    <p v-if="!user.profileCompleted">Please complete your profile to increase your chances of getting hired!</p>
    <button v-if="!user.profileCompleted" @click="editProfile = !editProfile">Complete Profile</button>

    <!-- Profile Edit Form -->
    <div v-if="editProfile">
      <h3>Complete your profile:</h3>
      <form @submit.prevent="saveProfile">
        <div>
          <label for="gender">Gender:</label>
          <select v-model="profileData.gender" id="gender">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label for="location">Location:</label>
          <input v-model="profileData.location" id="location" type="text" placeholder="Enter your location" />
        </div>

        <div>
          <label for="englishLevel">English Language Level:</label>
          <select v-model="profileData.englishLevel" id="englishLevel">
            <option value="very_basic">Very Basic</option>
            <option value="conversational">Conversational</option>
            <option value="fluent">Fluent</option>
          </select>
        </div>

        <div>
          <label for="qualification">Care Qualification:</label>
          <select v-model="profileData.qualification" id="qualification">
            <option value="medical_surgical">Medical/Surgical</option>
            <option value="nursing">Nursing</option>
            <option value="nvq_health_social_care">NVQ Health and Social Care</option>
            <option value="occupational_therapy">Occupational Therapy</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label for="careExperience">General Care Experience:</label>
          <select v-model="profileData.careExperience" id="careExperience">
            <option value="care_for_relatives">Care for Close Relatives</option>
            <option value="home_care">Home Care</option>
            <option value="live_in_care">Live-in Care</option>
            <option value="nursing">Nursing</option>
            <option value="no_experience">No Experience</option>
            <option value="would_like_training">Would Like Help with Training</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label for="liveInExperience">Live-in Experience:</label>
          <select v-model="profileData.liveInExperience" id="liveInExperience">
            <option value="less_than_a_year">Less than a Year</option>
            <option value="1_to_3_years">1-3 Years</option>
            <option value="4_to_6_years">4-6 Years</option>
            <option value="more_than_6_years">More than 6 Years</option>
          </select>
        </div>

        <div>
          <label for="drivingLicence">Driving Licence:</label>
          <select v-model="profileData.drivingLicence" id="drivingLicence">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <button type="submit">Save Profile</button>
      </form>
    </div>

    <!-- Edit Email Form -->
    <div v-if="editEmail">
      <h3>Change Email</h3>
      <input v-model="updatedEmail" type="email" placeholder="Enter new email" />
      <button @click="updateEmail">Save Email</button>
    </div>

    <!-- Edit Password Form -->
    <div v-if="editPassword">
      <h3>Change Password</h3>
      <input v-model="currentPassword" type="password" placeholder="Current password" />
      <input v-model="newPassword" type="password" placeholder="New password" />
      <button @click="updatePassword">Save Password</button>
    </div>

    <!-- Show updated profile -->
    <div v-if="user">
      <h3>Profile Information</h3>
      <p><strong>Full Name:</strong> {{ user.fullName }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Gender:</strong> {{ formatString(user.profileData?.gender) }}</p>
      <p><strong>Location:</strong> {{ formatString(user.profileData?.location) }}</p>
      <p><strong>English Level:</strong> {{ formatString(user.profileData?.englishLevel) }}</p>
      <p><strong>Qualification:</strong> {{ formatString(user.profileData?.qualification) }}</p>
      <p><strong>Care Experience:</strong> {{ formatString(user.profileData?.careExperience) }}</p>
      <p><strong>Live-in Experience:</strong> {{ formatString(user.profileData?.liveInExperience) }}</p>
      <p><strong>Driving Licence:</strong> {{ formatString(user.profileData?.drivingLicence) }}</p>
    </div>

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
    const profileData = ref({
      gender: '',
      location: '',
      englishLevel: '',
      qualification: '',
      careExperience: '',
      liveInExperience: '',
      drivingLicence: '',
    });
    const errorMessage = ref('');
    const fileInput = ref(null);
    const token = localStorage.getItem('token');
    const router = useRouter();
    const editEmail = ref(false);
    const editPassword = ref(false);
    const editProfile = ref(false);

    const goBack = () => {
      router.back();
    };

    // Utility function to format strings
    const formatString = (str) => {
      if (!str) return '';
      return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // Fetch user profile when the component is mounted
    onMounted(async () => {
      if (!token) {
        alert('You must be logged in to view this page.');
        router.push('/login');
        return;
      }

      try {
        const response = await apiClient.get('/auth/profile');
        console.log('Profile fetched successfully:', response.data);
        user.value = response.data; // Update user profile with the response
        updatedEmail.value = response.data.email;
        profileData.value = { ...user.value.profileData };
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
        user.value.email = updatedEmail.value;
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
        currentPassword.value = '';
        newPassword.value = '';
        editPassword.value = false; // Hide password input fields after save
      } catch (error) {
        console.error('Error updating password:', error);
        alert('Error updating password. Please try again.');
      }
    };

    const saveProfile = async () => {
      // Validate the profile data
      if (!profileData.value.gender || !profileData.value.location || !profileData.value.englishLevel || 
          !profileData.value.qualification || !profileData.value.careExperience || !profileData.value.liveInExperience || 
          !profileData.value.drivingLicence) {
        alert('Please fill in all fields before saving.');
        return;
      }

      try {
        const payload = { ...profileData.value };

        // Send the update request to the backend
        const response = await apiClient.put('/auth/update-profile', payload);

        alert('Profile updated successfully!');
        console.log(response.data);

        // Update the user profile data in the UI
        user.value.profileData = { ...profileData.value }; // Ensure that the profile data is updated in the UI
        user.value.profileCompleted = true; // Mark profile as completed
        editProfile.value = false; // Hide the profile edit form
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
      }

      console.log('Profile Data:', profileData.value);
    };

    // Upload profile picture
    const uploadProfilePicture = async () => {
      const formData = new FormData();
      formData.append('profilePicture', fileInput.value.files[0]);

      try {
        const response = await apiClient.post('/auth/upload-profile-picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        alert('Profile picture uploaded successfully!');
        user.value.profilePicture = response.data.profilePicture;
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
      profileData,
      errorMessage,
      editEmail,
      editPassword,
      editProfile,
      fileInput,
      saveProfile,
      updateEmail,
      updatePassword,
      uploadProfilePicture,
      goBack,
      formatString,
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

input,
select {
  margin: 10px 0;
  padding: 5px;
  width: 200px;
}
</style>
