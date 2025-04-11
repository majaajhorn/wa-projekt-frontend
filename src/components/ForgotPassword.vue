<script setup>
import { ref } from 'vue';
import { requestPasswordReset } from '../services/authService';

const email = ref('');
const message = ref('');
const messageType = ref('');
const loading = ref(false);
const submitted = ref(false);
const tempPassword = ref('');

const submitForm = async () => {
  if (!email.value) {
    message.value = 'Please enter your email address.';
    messageType.value = 'error';
    return;
  }
  
  try {
    loading.value = true;
    const response = await requestPasswordReset(email.value);
    message.value = response.data.message || 'Password reset successful.';
    messageType.value = 'success';
    submitted.value = true;
    
    // For university project only - display the temporary password
    if (response.data.tempPassword) {
      tempPassword.value = response.data.tempPassword;
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
      <h2 class="form-title">Forgot Your Password?</h2>
      
      <div v-if="!submitted">
        <p class="form-description">
          Enter your email address to receive a temporary password.
        </p>
        
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              required 
              placeholder="Enter your email address"
            />
          </div>
          
          <button 
            type="submit" 
            class="submit-button"
            :disabled="loading"
          >
            <span v-if="loading">Processing...</span>
            <span v-else>Get Temporary Password</span>
          </button>
        </form>
      </div>
      
      <div v-else class="success-container">
        <div class="success-icon">✓</div>
        <h3>Password Reset</h3>
        <p>{{ message }}</p>
        
        <!-- For university project only -->
        <div v-if="tempPassword" class="temp-password-box">
          <h4>Your Temporary Password</h4>
          <p class="temp-password">{{ tempPassword }}</p>
          <p>Please use this to log in, then change your password immediately.</p>
        </div>
        
        <div class="login-button-container">
          <router-link to="/login" class="login-button">Go to Login</router-link>
        </div>
      </div>
      
      <p v-if="message && !submitted" :class="['message', messageType]">
        {{ message }}
      </p>
      
      <div class="form-footer" v-if="!submitted">
        <router-link to="/login" class="link">Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.form-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 450px;
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

.submit-button {
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

.submit-button:hover {
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

.form-footer {
  margin-top: 25px;
  text-align: center;
  color: #666;
}

.link {
  color: #4a6ee0;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
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

.temp-password-box {
  margin: 25px auto;
  padding: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  max-width: 300px;
}

.temp-password {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  padding: 8px 12px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin: 10px 0;
}

.login-button-container {
  margin-top: 20px;
}

.login-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4a6ee0;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #3d5cbe;
}
</style>