<template>
    <nav class="navbar">
      <div class="navbar-logo">
        <router-link to="/">
          <img src="/carematch_logo.png" alt="CareMatch Logo" class="logo-image">
        </router-link>
      </div>
      
      <div class="navbar-links">
        
        <router-link to="/login" class="nav-link login-link">
          Login
        </router-link>
        
        <router-link to="/register" class="sign-out-btn get-started-btn">
          Get Started
        </router-link>
      </div>
    </nav>
  </template>
  
<script>
  export default {
    name: 'PublicNavBar'
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
    font-size: 18px;  /* Increased from 16px to 18px */
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
  
  .login-link {
    color: #4299e1;
    font-weight: 600;
    font-size: 18px;  /* Increased from 16px to 18px */
  }
  
  .get-started-btn {
    text-decoration: none;
  }
  
  .sign-out-btn {
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 12px 24px;  
    font-size: 18px;  
    font-weight: 600;  
    cursor: pointer;
    transition: background-color 0.3s;
    display: inline-block;
  }
  
  .sign-out-btn:hover {
    background-color: #3182ce;
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
      font-size: 16px;  /* Adjusted for mobile */
    }
    
    .sign-out-btn {
      padding: 10px 18px;  /* Adjusted for mobile */
      font-size: 14px;
    }
  }
  </style>