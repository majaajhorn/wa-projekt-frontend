<script setup>
import { ref } from 'vue';
import { changePassword } from '../services/authService';

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const messageType = ref('');
const loading = ref(false);
const success = ref(false);

const submitForm = async () => {
  // Validate passwords
  if (newPassword.value.length < 8) {
    message.value = 'New password must be at least 8 characters long.';
    messageType.value = 'error';
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Passwords do not match.';
    messageType.value = 'error';
    return;
  }
  
  try {
    loading.value = true;
    const response = await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    });
    
    message.value = response.data.message || 'Your password has been changed successfully.';
    messageType.value = 'success';
    success.value = true;
    
    // Clear the temporary password flag in local storage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      userData.passwordTemporary = false;
      localStorage.setItem('user', JSON.stringify(userData));
    }
  } catch (error) {
    message.value = error.response?.data?.message || 'An error occurred. Please try again.';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="form-container">
    <div class="form-card">
      <h2 class="form-title">Change Your Password</h2>
      
      <div v-if="!success">
        <p class="form-description">
          For security reasons, please change your temporary password to a new permanent password.
        </p>
        
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input 
              id="currentPassword" 
              v-model="currentPassword" 
              type="password" 
              required 
              placeholder="Enter your temporary password"
            />
          </div>
          
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input 
              id="newPassword" 
              v-model="newPassword" 
              type="password" 
              required 
              placeholder="Enter new password"
            />
            <small class="input-hint">Must be at least 8 characters</small>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword" 
              v-model="confirmPassword" 
              type="password" 
              required 
              placeholder="Confirm new password"
            />
          </div>
          
          <button 
            type="submit" 
            class="submit-button"
            :disabled="loading"
          >
            <span v-if="loading">Processing...</span>
            <span v-else>Change Password</span>
          </button>
        </form>
      </div>
      
      <div v-else class="success-container">
        <div class="success-icon">✓</div>
        <h3>Password Changed Successfully</h3>
        <p>Your password has been updated. You can now continue using the application.</p>
        <button @click="$emit('passwordChanged')" class="continue-button">Continue</button>
      </div>
      
      <p v-if="message && !success" :class="['message', messageType]">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 20px;
}

.form-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 30px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.form-description {
  text-align: center;
  margin-bottom: 25px;
  color: #555;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #4a6ee0;
  outline: none;
}

.input-hint {
  display: block;
  margin-top: 6px;
  color: #6c757d;
  font-size: 14px;
}

.submit-button, .continue-button {
  width: 100%;
  padding: 14px;
  background-color: #4a6ee0;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover, .continue-button:hover {
  background-color: #3d5cbe;
}

.submit-button:disabled {
  background-color: #a0afd7;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}

.message.success {
  background-color: #e7f7ed;
  color: #28a745;
  border: 1px solid #a3d9b0;
}

.message.error {
  background-color: #fbecec;
  color: #dc3545;
  border: 1px solid #f5c6cb;
}

.success-container {
  text-align: center;
  padding: 10px 0;
}

.success-icon {
  width: 60px;
  height: 60px;
  line-height: 60px;
  background-color: #28a745;
  color: white;
  font-size: 30px;
  border-radius: 50%;
  margin: 0 auto 20px;
}
</style>