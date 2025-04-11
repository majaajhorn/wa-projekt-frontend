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

        <!-- About Yourself Section - for both roles -->
        <div class="form-group full-width">
          <label for="aboutYourself">About Yourself</label>
          <textarea 
            v-model="profileData.aboutYourself" 
            id="aboutYourself" 
            placeholder="Tell us about yourself, your experience, skills, and interests..." 
            class="text-area"
            rows="5"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="editProfile = false" class="cancel-btn">Cancel</button>
          <button type="submit" class="primary-btn">Save Profile</button>
        </div>
      </form>
    </div>

    <!-- Edit Email Modal -->
    <div v-if="editEmail" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Change Email</h3>
          <button @click="editEmail = false" class="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <input v-model="updatedEmail" type="email" placeholder="Enter new email" class="text-input" />
        </div>
        <div class="modal-footer">
          <button @click="editEmail = false" class="cancel-btn">Cancel</button>
          <button @click="updateEmail" class="primary-btn">Save Email</button>
        </div>
      </div>
    </div>

    <!-- Edit Password Modal -->
    <div v-if="editPassword" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Change Password</h3>
          <button @click="editPassword = false" class="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label for="currentPassword">Current Password</label>
            <input v-model="currentPassword" id="currentPassword" type="password" placeholder="Current password" class="text-input" />
          </div>
          <div class="form-field">
            <label for="newPassword">New Password</label>
            <input v-model="newPassword" id="newPassword" type="password" placeholder="New password" class="text-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="editPassword = false" class="cancel-btn">Cancel</button>
          <button @click="updatePassword" class="primary-btn">Save Password</button>
        </div>
      </div>
    </div>

    <!-- Edit About Modal Popup -->
    <div v-if="showEditAbout" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">About Yourself</h3>
          <button @click="closeEditAbout" class="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="aboutYourselfText" 
            placeholder="Tell us about yourself, your experience, skills, and interests..." 
            class="text-area"
            rows="8"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button @click="closeEditAbout" class="cancel-btn">Cancel</button>
          <button @click="updateAbout" class="primary-btn">Save</button>
        </div>
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

        <!-- About section for both roles -->
        <div class="info-item full-width">
          <span class="info-label">About</span>
          <div class="about-content">
            <p v-if="user.profileData?.aboutYourself">{{ user.profileData.aboutYourself }}</p>
            <span v-else class="info-value empty">No information provided</span>
            <button @click="editAbout" class="edit-about-btn">
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Display reviews section for jobseekers -->
    <div v-if="user.role === 'jobseeker'" class="reviews-section">
      <JobseekerReviews :jobseekerId="user._id || user.id" />
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
import JobseekerReviews from './JobseekerReviews.vue';

export default {
  name: 'MyProfile',
  components: {
    JobseekerReviews
  },
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
      aboutYourself: '', // Added for About section
    });
    
    // About section refs
    const showEditAbout = ref(false);
    const aboutYourselfText = ref('');
    
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
      // Determine which dashboard to return to based on user role
      const userRole = localStorage.getItem('userRole') || 
                      (localStorage.getItem('token') ? 
                      JSON.parse(atob(localStorage.getItem('token').split('.')[1])).role : 
                      'jobseeker');
                      
      if (userRole === 'employer') {
        router.push('/employer-dashboard');
      } else {
        router.push('/jobseeker-dashboard');
      }
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
          aboutYourself: user.value.profileData.aboutYourself || '', // Added for About section
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
          location: '',
          aboutYourself: '' // Added for About section
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
    
    // Edit About section with modal
    const editAbout = () => {
      aboutYourselfText.value = user.value.profileData?.aboutYourself || '';
      showEditAbout.value = true;
      document.body.classList.add('body-no-scroll'); // Prevent scrolling
    };
    
    // Close About modal
    const closeEditAbout = () => {
      showEditAbout.value = false;
      document.body.classList.remove('body-no-scroll');
    };
    
    // Update About section
    const updateAbout = async () => {
      try {
        const payload = {
          aboutYourself: aboutYourselfText.value
        };

        await apiClient.put('/auth/update-profile', payload);
        
        // Update local user data
        if (!user.value.profileData) {
          user.value.profileData = {};
        }
        user.value.profileData.aboutYourself = aboutYourselfText.value;
        
        alert('About information updated successfully!');
        showEditAbout.value = false;
        document.body.classList.remove('body-no-scroll'); // Re-enable scrolling
      } catch (error) {
        console.error('Error updating about information:', error);
        alert('Error updating information. Please try again.');
      }
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
      handleEditProfile,
      // About section
      showEditAbout,
      aboutYourselfText,
      editAbout,
      closeEditAbout,
      updateAbout
    };
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.profile-title {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #333;
}

/* Profile Picture Section */
.profile-picture-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.profile-picture-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  border: 3px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-picture-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  font-size: 2.5rem;
  color: #777;
  font-weight: bold;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-upload-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-block;
  transition: all 0.2s ease;
}

.file-upload-btn:hover {
  background-color: #e8e8e8;
}

.hidden-input {
  display: none;
}

.upload-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background-color: #3d9040;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.action-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #e8e8e8;
  color: #333;
}

/* Complete Profile Alert */
.complete-profile-alert {
  background-color: #fff9c4;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.complete-profile-alert p {
  margin: 0 0 10px 0;
  color: #5d4037;
}

/* Profile Form */
.profile-form-container {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto 30px auto;
}

.section-title {
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.text-input, .custom-select select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.text-input:focus, .custom-select select:focus {
  border-color: #4caf50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.custom-select {
  position: relative;
}

.custom-select select {
  appearance: none;
  background-color: white;
  cursor: pointer;
}

.custom-select::after {
  content: "▼";
  font-size: 12px;
  color: #666;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.modern-checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.modern-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.modern-checkbox input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  margin-right: 10px;
  transition: all 0.2s ease;
}

.modern-checkbox input[type="checkbox"]:checked + label .checkbox-custom {
  background-color: #4caf50;
  border-color: #4caf50;
}

.modern-checkbox input[type="checkbox"]:checked + label .checkbox-custom::after {
  content: "✓";
  color: white;
  position: absolute;
  left: 5px;
  top: -2px;
}

.text-area {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s ease;
}

.text-area:focus {
  border-color: #4caf50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .primary-btn {
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.primary-btn {
  background-color: #4caf50;
  color: white;
}

.primary-btn:hover {
  background-color: #3d9040;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modalFadeIn 0.3s;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

/* Display Profile Information */
.profile-info {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  position: relative;
}

.edit-profile-btn-container {
  position: absolute;
  top: 20px;
  right: 20px;
}

.edit-profile-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.edit-profile-btn:hover {
  background-color: #e8e8e8;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.info-value {
  font-size: 1.1rem;
  color: #333;
}

.info-value.empty {
  color: #999;
  font-style: italic;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
}

.tag {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 0.9rem;
}

.about-content {
  position: relative;
}

.edit-about-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: #4caf50;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px;
}

.edit-about-btn:hover {
  text-decoration: underline;
}

/* Back Button */
.back-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  margin-top: 20px;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: #333;
}

/* Reviews Section */
.reviews-section {
  margin-top: 30px;
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

/* Responsive styles */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modern-checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .profile-picture-section {
    flex-direction: column;
    align-items: center;
  }
  
  .profile-picture-container {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .edit-profile-btn-container {
    position: static;
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-end;
  }
}

/* Two-column layout styles */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  gap: 30px;
  margin-bottom: 30px;
}

.profile-column {
  width: 100%;
}

.reviews-column {
  width: 100%;
}

.profile-info, .reviews-section {
  height: 100%;
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

/* Make the layout stack on mobile */
@media (max-width: 992px) {
  .two-column-layout {
    grid-template-columns: 1fr; /* Single column on smaller screens */
  }
}
</style>