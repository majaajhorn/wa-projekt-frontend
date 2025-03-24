<template>
    <nav class="navbar">
      <div class="navbar-logo">
        <!-- Updated logo link to direct to the appropriate dashboard based on user role -->
        <router-link :to="userRole === 'employer' ? '/employer-dashboard' : '/jobseeker-dashboard'">
          <img src="../assets/carematch-logo.png" alt="CareMatch Logo" class="logo-image">
        </router-link>
      </div>
      <div class="navbar-links">
        <!-- Show "Browse Jobs" for jobseekers, "Browse Carers" for employers -->
        <router-link 
          :to="userRole === 'employer' ? '/browse-carers' : '/job-search'"
          class="nav-link"
        >
          {{ userRole === 'employer' ? 'Browse Carers' : 'Browse Jobs' }}
        </router-link>
        
        <!-- Link to Profile -->
        <router-link to="/my-profile" class="nav-link">
          My Profile
        </router-link>
        
        <!-- About Link -->
        <router-link to="/about" class="nav-link">
          About
        </router-link>
        
        <!-- Sign Out Button -->
        <button @click="signOut" class="sign-out-btn">
          Sign out
        </button>
      </div>
    </nav>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'NavBar',
    setup() {
      const router = useRouter();
      const userRole = ref('');
      
      onMounted(() => {
        // Get user role from localStorage
        userRole.value = localStorage.getItem('userRole') || 'jobseeker';
      });
      
      const signOut = () => {
        // Clear user data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        
        // Redirect to home/login page
        router.push('/');
      };
      
      return {
        userRole,
        signOut
      };
    }
  };
  </script>
  
  <style scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .navbar-logo {
    flex: 0 0 auto;
  }
  
  .logo-image {
    height: 50px;
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
  
  @media (max-width: 768px) {
    .navbar {
      flex-direction: column;
      padding: 15px;
    }
    
    .navbar-logo {
      margin-bottom: 15px;
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
  }
  </style>