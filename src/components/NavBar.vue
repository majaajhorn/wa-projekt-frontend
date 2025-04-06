<template>
  <nav class="navbar">
    <div class="navbar-logo">
      <router-link :to="userRole === 'employer' ? '/employer-dashboard' : '/jobseeker-dashboard'">
        <img src="../assets/carematch-logo.png" alt="CareMatch Logo" class="logo-image">
      </router-link>
    </div>
    <div class="navbar-links">
      <router-link 
        :to="userRole === 'employer' ? '/browse-carers' : '/job-search'"
        class="nav-link"
      >
        {{ userRole === 'employer' ? 'Browse Carers' : 'Browse Jobs' }}
      </router-link>

      <NotificationBell v-if="isLoggedIn" />
      
      <router-link to="/my-profile" class="nav-link">
        My Profile
      </router-link>
      
      <router-link to="/about" class="nav-link">
        About
      </router-link>
      
      <button @click="confirmSignOut" class="sign-out-btn">
        Sign out
      </button>
    </div>
    
    <!-- Sign Out Confirmation Modal -->
    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal-content">
        <h3>Sign Out</h3>
        <p>Are you sure you want to sign out?</p>
        <div class="modal-buttons">
          <button @click="executeSignOut" class="confirm-btn">Yes, Sign Out</button>
          <button @click="cancelSignOut" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NotificationBell from './NotificationBell.vue';

export default {
  name: 'NavBar',
  components: {
    NotificationBell
  },
  setup() {
    const router = useRouter();
    const userRole = ref('');
    const showConfirmation = ref(false);
    const isLoggedIn = ref(false);
    
    onMounted(() => {
      // Get user role from localStorage
      userRole.value = localStorage.getItem('userRole') || 'jobseeker';
      // Check if user is logged in
      isLoggedIn.value = !!localStorage.getItem('token');
    });
    
    const confirmSignOut = () => {
      showConfirmation.value = true;
    };
    
    const cancelSignOut = () => {
      showConfirmation.value = false;
    };
    
    const executeSignOut = () => {
      // Clear user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      
      // Close the confirmation modal
      showConfirmation.value = false;
      
      // Update login state
      isLoggedIn.value = false;
      
      // Redirect to home/login page
      router.push('/');
    };
    
    return {
      userRole,
      isLoggedIn,
      showConfirmation,
      confirmSignOut,
      cancelSignOut,
      executeSignOut
    };
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 30px;
  position: relative;
  top: -10px;
}

.navbar-logo {
  flex: 0 0 auto;
}

.logo-image {
  height: 100px;
  width: auto;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #4299e1;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #4299e1;
  transition: width 0.3s;
}

.nav-link:hover::after {
  width: 100%;
}

.sign-out-btn {
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sign-out-btn:hover {
  background-color: #3182ce;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 20px;
}

.modal-content p {
  margin-bottom: 20px;
  color: #555;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.confirm-btn {
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-btn:hover {
  background-color: #3182ce;
}

.cancel-btn {
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #cbd5e0;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 5px 15px;
    top: -5px;
  }
  
  .navbar-logo {
    margin-bottom: 10px;
  }
  
  .logo-image {
    height: 80px;
  }
  
  .navbar-links {
    width: 100%;
    justify-content: space-around;
    gap: 10px;
  }
  
  .nav-link {
    font-size: 14px;
  }
  
  .sign-out-btn {
    padding: 8px 15px;
    font-size: 12px;
  }
  
  .modal-content {
    padding: 20px;
    width: 300px;
  }
}
</style>