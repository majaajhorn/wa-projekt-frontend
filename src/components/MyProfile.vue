<template>
  <div class="profile-container">
    <h1 class="profile-title">My Profile</h1>

    <!-- Profile Picture Section -->
    <div class="profile-picture-section">
      <div class="profile-picture-container">
        <img v-if="user.profilePicture" :src="user.profilePicture" alt="Profile Picture" class="profile-picture" />
        <div v-else class="profile-picture-placeholder">
          <span>{{ getInitials(user.fullName) }}</span>
        </div>
      </div>
      <form @submit.prevent="uploadProfilePicture" class="upload-form">
        <label for="profilePicture" class="file-upload-btn">
          <span>Upload New Photo</span>
          <input type="file" id="profilePicture" ref="fileInput" class="hidden-input" />
        </label>
        <button type="submit" class="upload-btn">Save</button>
      </form>
    </div>

    <!-- Display User Info -->
    <div v-if="user" class="action-buttons">
      <button @click="editEmail = !editEmail" class="action-btn">
        <span>Change Email</span>
      </button>
      <button @click="editPassword = !editPassword" class="action-btn">
        <span>Change Password</span>
      </button>
    </div>

    <!-- Complete Profile Section -->
    <div v-if="!user.profileCompleted" class="complete-profile-alert">
      <p v-if="user.role === 'jobseeker'">Please complete your profile to increase your chances of getting hired!</p>
      <p v-else-if="user.role === 'employer'">Please complete your employer profile to start posting jobs!</p>
      <button @click="editProfile = !editProfile" class="primary-btn">Complete Profile</button>
    </div>

    <!-- Profile Edit Form -->
    <div v-if="editProfile" class="profile-form-container">
      <h3 class="section-title">Complete your profile</h3>
      <form @submit.prevent="saveProfile" class="profile-form">
        <!-- Common fields for both jobseeker and employer -->
        <div class="form-group">
          <label for="gender">Gender</label>
          <div class="custom-select">
            <select v-model="profileData.gender" id="gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="location">Location</label>
          <input v-model="profileData.location" id="location" type="text" placeholder="Enter your location" class="text-input" />
        </div>

        <!-- Fields only for jobseeker -->
        <template v-if="user.role === 'jobseeker'">
          <div class="form-group">
            <label for="englishLevel">English Language Level</label>
            <div class="custom-select">
              <select v-model="profileData.englishLevel" id="englishLevel">
                <option value="very_basic">Very Basic</option>
                <option value="conversational">Conversational</option>
                <option value="fluent">Fluent</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Care Qualification (select all that apply)</label>
            <div class="modern-checkbox-group">
              <div v-for="option in qualificationOptions" :key="option.value" class="modern-checkbox">
                <input 
                  type="checkbox" 
                  :id="'qualification-' + option.value" 
                  :value="option.value" 
                  v-model="profileData.qualification" 
                />
                <label :for="'qualification-' + option.value">
                  <span class="checkbox-custom"></span>
                  {{ option.label }}
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>General Care Experience (select all that apply)</label>
            <div class="modern-checkbox-group">
              <div v-for="option in careExperienceOptions" :key="option.value" class="modern-checkbox">
                <input 
                  type="checkbox" 
                  :id="'careExperience-' + option.value" 
                  :value="option.value" 
                  v-model="profileData.careExperience" 
                />
                <label :for="'careExperience-' + option.value">
                  <span class="checkbox-custom"></span>
                  {{ option.label }}
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="liveInExperience">Live-in Experience</label>
            <div class="custom-select">
              <select v-model="profileData.liveInExperience" id="liveInExperience">
                <option value="less_than_a_year">Less than a Year</option>
                <option value="1_to_3_years">1-3 Years</option>
                <option value="4_to_6_years">4-6 Years</option>
                <option value="more_than_6_years">More than 6 Years</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="drivingLicence">Driving Licence</label>
            <div class="custom-select">
              <select v-model="profileData.drivingLicence" id="drivingLicence">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </template>
        
        <!-- Fields only for employer could be added here -->
        <template v-if="user.role === 'employer'">
          <div class="form-group">
            <label for="companyName">Company Name</label>
            <input v-model="profileData.companyName" id="companyName" type="text" placeholder="Enter your company name" class="text-input" />
          </div>
        </template>

        <div class="form-actions">
          <button type="button" @click="editProfile = false" class="cancel-btn">Cancel</button>
          <button type="submit" class="primary-btn">Save Profile</button>
        </div>
      </form>
    </div>

    <!-- Edit Email Form -->
    <div v-if="editEmail" class="modal-form">
      <h3 class="section-title">Change Email</h3>
      <input v-model="updatedEmail" type="email" placeholder="Enter new email" class="text-input" />
      <div class="form-actions">
        <button @click="editEmail = false" class="cancel-btn">Cancel</button>
        <button @click="updateEmail" class="primary-btn">Save Email</button>
      </div>
    </div>

    <!-- Edit Password Form -->
    <div v-if="editPassword" class="modal-form">
      <h3 class="section-title">Change Password</h3>
      <input v-model="currentPassword" type="password" placeholder="Current password" class="text-input" />
      <input v-model="newPassword" type="password" placeholder="New password" class="text-input" />
      <div class="form-actions">
        <button @click="editPassword = false" class="cancel-btn">Cancel</button>
        <button @click="updatePassword" class="primary-btn">Save Password</button>
      </div>
    </div>

    <!-- Show updated profile -->
    <div v-if="user && !editProfile" class="profile-info">
      <h3 class="section-title">Profile Information</h3>
      
      <!-- New Edit Profile Button -->
      <div class="edit-profile-btn-container">
        <button @click="handleEditProfile" class="edit-profile-btn">
          <span>Edit Profile</span>
        </button>
      </div>
      
      <div class="info-grid">
        <!-- Common fields for both employer and jobseeker -->
        <div class="info-item">
          <span class="info-label">Full Name</span>
          <span class="info-value">{{ user.fullName }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Email</span>
          <span class="info-value">{{ user.email }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Gender</span>
          <span class="info-value">{{ formatString(user.profileData?.gender) }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Location</span>
          <span class="info-value">{{ formatString(user.profileData?.location) }}</span>
        </div>
        
        <!-- Fields only for employer -->
        <template v-if="user.role === 'employer' && user.profileData?.companyName">
          <div class="info-item">
            <span class="info-label">Company Name</span>
            <span class="info-value">{{ user.profileData.companyName }}</span>
          </div>
        </template>
        
        <!-- Fields only for jobseeker -->
        <template v-if="user.role === 'jobseeker'">
          <div class="info-item">
            <span class="info-label">English Level</span>
            <span class="info-value">{{ formatString(user.profileData?.englishLevel) }}</span>
          </div>
          
          <div class="info-item full-width">
            <span class="info-label">Qualifications</span>
            <div v-if="user.profileData?.qualification && user.profileData.qualification.length > 0" class="tags-container">
              <span v-for="(qual, index) in user.profileData.qualification" :key="index" class="tag">
                {{ formatString(qual) }}
              </span>
            </div>
            <span v-else class="info-value empty">None specified</span>
          </div>
          
          <div class="info-item full-width">
            <span class="info-label">Care Experience</span>
            <div v-if="user.profileData?.careExperience && user.profileData.careExperience.length > 0" class="tags-container">
              <span v-for="(exp, index) in user.profileData.careExperience" :key="index" class="tag">
                {{ formatString(exp) }}
              </span>
            </div>
            <span v-else class="info-value empty">None specified</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Live-in Experience</span>
            <span class="info-value">{{ formatString(user.profileData?.liveInExperience) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Driving Licence</span>
            <span class="info-value">{{ formatString(user.profileData?.drivingLicence) }}</span>
          </div>
        </template>
      </div>
    </div>

    <button @click="goBack" class="back-btn">
      <span>← Go Back</span>
    </button>
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
      qualification: [], // Changed to array for multiple selections
      careExperience: [], // Changed to array for multiple selections
      liveInExperience: '',
      drivingLicence: '',
    });
    
    // Options for qualification checkboxes
    const qualificationOptions = ref([
      { value: 'medical_surgical', label: 'Medical/Surgical' },
      { value: 'nursing', label: 'Nursing' },
      { value: 'nvq_health_social_care', label: 'NVQ Health and Social Care' },
      { value: 'occupational_therapy', label: 'Occupational Therapy' },
      { value: 'other', label: 'Other' }
    ]);
    
    // Options for care experience checkboxes
    const careExperienceOptions = ref([
      { value: 'care_for_relatives', label: 'Care for Close Relatives' },
      { value: 'home_care', label: 'Home Care' },
      { value: 'live_in_care', label: 'Live-in Care' },
      { value: 'nursing', label: 'Nursing' },
      { value: 'no_experience', label: 'No Experience' },
      { value: 'would_like_training', label: 'Would Like Help with Training' },
      { value: 'other', label: 'Other' }
    ]);
    
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

    // Get user's initials for the profile picture placeholder
    const getInitials = (name) => {
      if (!name) return '';
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    // Utility function to format strings
    const formatString = (str) => {
      if (!str) return '';
      return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // Handle the Edit Profile button click
    const handleEditProfile = () => {
      // Initialize profile data based on role
      if (user.value.profileData) {
        // Common fields for both roles
        profileData.value = {
          ...user.value.profileData,
          gender: user.value.profileData.gender || '',
          location: user.value.profileData.location || '',
        };
        
        // Fields specific to jobseeker
        if (user.value.role === 'jobseeker') {
          profileData.value = {
            ...profileData.value,
            englishLevel: user.value.profileData.englishLevel || '',
            // Ensure qualification is an array
            qualification: Array.isArray(user.value.profileData.qualification) 
              ? [...user.value.profileData.qualification] 
              : user.value.profileData.qualification ? [user.value.profileData.qualification] : [],
            // Ensure careExperience is an array
            careExperience: Array.isArray(user.value.profileData.careExperience) 
              ? [...user.value.profileData.careExperience] 
              : user.value.profileData.careExperience ? [user.value.profileData.careExperience] : [],
            liveInExperience: user.value.profileData.liveInExperience || '',
            drivingLicence: user.value.profileData.drivingLicence || ''
          };
        }
        
        // Fields specific to employer
        if (user.value.role === 'employer') {
          profileData.value = {
            ...profileData.value,
            companyName: user.value.profileData.companyName || ''
          };
        }
      } else {
        // Initialize empty profile data if none exists
        profileData.value = {
          gender: '',
          location: ''
        };
        
        // Add role-specific empty fields
        if (user.value.role === 'jobseeker') {
          profileData.value = {
            ...profileData.value,
            englishLevel: '',
            qualification: [],
            careExperience: [],
            liveInExperience: '',
            drivingLicence: ''
          };
        } else if (user.value.role === 'employer') {
          profileData.value = {
            ...profileData.value,
            companyName: ''
          };
        }
      }
      
      // Toggle edit mode
      editProfile.value = true;
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
        
        // Handle both array and string format for backward compatibility
        if (user.value.profileData) {
          // Initialize profile data from user data
          profileData.value = { 
            ...user.value.profileData,
            // Ensure qualification is an array
            qualification: Array.isArray(user.value.profileData.qualification) 
              ? [...user.value.profileData.qualification] 
              : user.value.profileData.qualification ? [user.value.profileData.qualification] : [],
            // Ensure careExperience is an array
            careExperience: Array.isArray(user.value.profileData.careExperience) 
              ? [...user.value.profileData.careExperience] 
              : user.value.profileData.careExperience ? [user.value.profileData.careExperience] : []
          };
        }
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
      // Different validation based on user role
      if (user.value.role === 'jobseeker') {
        // Validate jobseeker profile data - all fields are required
        if (!profileData.value.gender || !profileData.value.location || !profileData.value.englishLevel || 
            profileData.value.qualification.length === 0 || profileData.value.careExperience.length === 0 || 
            !profileData.value.liveInExperience || !profileData.value.drivingLicence) {
          alert('Please fill in all fields before saving.');
          return;
        }
      } else if (user.value.role === 'employer') {
        // Validate employer profile data - only basic fields required
        if (!profileData.value.gender || !profileData.value.location || !profileData.value.companyName) {
          alert('Please fill in all fields before saving.');
          return;
        }
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
      if (!fileInput.value.files[0]) {
        alert('Please select a file first.');
        return;
      }
      
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
      qualificationOptions,
      careExperienceOptions,
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
      getInitials,
      handleEditProfile, // Expose the new method
    };
  },
};
</script>

<style scoped>
/* Base styles */
.profile-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #333;
}

.profile-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #2c3e50;
  text-align: center;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0;
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

/* Profile picture styles */
.profile-picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.profile-picture-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid #fff;
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-picture-placeholder {
  width: 100%;
  height: 100%;
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
}

.upload-form {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-upload-btn {
  background-color: #f5f5f5;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid #ddd;
  display: inline-block;
  transition: all 0.3s ease;
}

.file-upload-btn:hover {
  background-color: #e9e9e9;
}

.hidden-input {
  display: none;
}

.upload-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background-color: #45a049;
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.action-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

/* New Edit Profile Button */
.edit-profile-btn-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.edit-profile-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-profile-btn:hover {
  background-color: #45a049;
}

/* Complete profile alert */
.complete-profile-alert {
  background-color: #e7f5ff;
  border-left: 4px solid #339af0;
  padding: 15px;
  margin-bottom: 30px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.complete-profile-alert p {
  margin: 0;
  color: #1971c2;
  font-size: 15px;
}

/* Form styles */
.profile-form-container {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.profile-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.text-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

/* Custom select */
.custom-select {
  position: relative;
  width: 100%;
}

.custom-select select {
  appearance: none;
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 15px;
  background-color: white;
  cursor: pointer;
}

.custom-select select:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.custom-select::after {
  content: '▼';
  font-size: 12px;
  color: #495057;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Modern checkboxes */
.modern-checkbox-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.modern-checkbox {
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  margin-bottom: 8px;
}

.modern-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: all 0.2s;
}

.modern-checkbox:hover input ~ .checkbox-custom {
  border-color: #4CAF50;
}

.modern-checkbox input:checked ~ .checkbox-custom {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
}

.modern-checkbox input:checked ~ .checkbox-custom:after {
  display: block;
}

.modern-checkbox .checkbox-custom:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Buttons */
.primary-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
}

.primary-btn:hover {
  background-color: #45a049;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #f1f3f5;
  color: #495057;
  border: 1px solid #ced4da;
  border-radius: 25px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: #e9ecef;
}

.back-btn {
  margin-top: 30px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 15px;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #343a40;
}

/* Form actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
  grid-column: span 2;
}

/* Modal forms */
.modal-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 400px;
  margin: 0 auto 30px;
}

.modal-form .text-input {
  margin-bottom: 15px;
}

/* Profile info display */
.profile-info {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 30px;
}

.info-item {
  margin-bottom: 10px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  display: block;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.info-value {
  font-size: 16px;
  color: #212529;
}

.info-value.empty {
  color: #adb5bd;
  font-style: italic;
}

/* Tags for skills display */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #e9ecef;
  color: #495057;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: inline-block;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-form {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item.full-width {
    grid-column: span 1;
  }
  
  .modern-checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>