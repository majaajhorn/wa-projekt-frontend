<template>
  <div>
    <PublicNavBar />
    <div class="home-container">
      <div class="hero-section">
        <div class="left-content">
          <h1 class="main-title">CareMatch</h1>
          <h2 class="subtitle">Your Trusted Care Connection</h2>
          
          <p class="description">
            Our platform is designed to connect dedicated carers with families and individuals 
            looking for compassionate and skilled care. Whether you're a carer seeking 
            meaningful work or someone in need of trustworthy in-home support, you've 
            come to the right place.
          </p>

          <div class="cta-buttons">
            <router-link to="/register" class="btn btn-primary">Get Started</router-link>
            <router-link to="/browse-carers" class="btn btn-secondary">Find Carers</router-link>
          </div>
        </div>
        
        <div class="right-content">
          <img src="../assets/4108044.jpg" alt="Care Illustration" class="hero-image">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PublicNavBar from './PublicNavBar.vue';

export default {
  name: 'Home',
  components: {
    PublicNavBar
  }
};
</script>

<style>
/* Global style to ensure the background extends throughout the app */
html, body {
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  height: 100%;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scrollbar */
}

#app {
  background-color: #ffffff;
  min-height: 100vh;
}
</style>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  background-color: #ffffff;
}

.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0 60px;
  gap: 40px;
}

.left-content {
  flex: 1;
}

.right-content {
  flex: 1;
  display: flex;
  justify-content: center;
}

.main-title {
  font-size: 4rem;
  color: #4299e1;
  margin-bottom: 10px;
  font-weight: bold;
}

.subtitle {
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
}

.description {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4299e1;
  color: white;
}

.btn-primary:hover {
  background-color: #3182ce;
}

.btn-secondary {
  background-color: transparent;
  color: #4299e1;
  border: 2px solid #4299e1;
}

.btn-secondary:hover {
  background-color: rgba(66, 153, 225, 0.1);
}

.hero-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
  }
  
  .main-title {
    font-size: 3rem;
  }
  
  .subtitle {
    font-size: 1.5rem;
  }
}
</style>