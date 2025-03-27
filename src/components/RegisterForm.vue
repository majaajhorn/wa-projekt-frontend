<script setup>
import { ref } from 'vue';
import { registerUser } from '../services/authService';

// Define reactive variables for full name, email, password, role, and message
const fullName = ref('');
const email = ref('');
const password = ref('');
const role = ref('jobseeker'); // Default role
const message = ref('');
const loading = ref(false);

// Define the register function
const register = async () => {
  try {
    loading.value = true;
    // Make the register request through authService
    const response = await registerUser({
      fullName: fullName.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });

    // Display the success message
    message.value = response.data.message;
  } catch (error) {
    // Display an error message if registration fails
    message.value = error.response?.data?.message || 'An error occurred.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="form-container">
    <div class="form-card">
      <h2 class="form-title">Create Account</h2>
      
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input 
            id="fullName" 
            v-model="fullName" 
            type="text" 
            required 
            placeholder="Enter your full name"
          />
        </div>
        
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
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            placeholder="Create a password"
          />
        </div>
        
        <div class="form-group">
          <label for="role">I'm registering as:</label>
          <div class="role-selector">
            <div 
              :class="['role-option', { active: role === 'jobseeker' }]"
              @click="role = 'jobseeker'"
            >
              <span class="role-icon">👤</span>
              <span>Jobseeker</span>
            </div>
            <div 
              :class="['role-option', { active: role === 'employer' }]"
              @click="role = 'employer'"
            >
              <span class="role-icon">🏢</span>
              <span>Employer</span>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          class="submit-button"
          :disabled="loading"
        >
          <span v-if="loading">Creating account...</span>
          <span v-else>Register</span>
        </button>
      </form>
      
      <p v-if="message" :class="['message', message.includes('success') ? 'success' : 'error']">
        {{ message }}
      </p>
      
      <div class="form-footer">
        Already have an account? <router-link to="/login" class="link">Sign in</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f9fafb;
}

.form-card {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 30px;
  text-align: center;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
  background-color: white;
}

.role-selector {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.role-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.role-option:hover {
  background-color: #f3f4f6;
}

.role-option.active {
  border-color: #3182ce;
  background-color: rgba(79, 70, 229, 0.05);
}

.role-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #3182ce;
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #3182ce;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.error {
  background-color: #fee2e2;
  color: #b91c1c;
}

.success {
  background-color: #dcfce7;
  color: #15803d;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.link {
  color: #3182ce;
  font-weight: 500;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>