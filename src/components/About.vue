<template>
    <div class="about-container">
      <div class="about-content">
        <h1 class="main-title">About Us</h1>
        <h2 class="subtitle">Connecting Compassionate Care with Those Who Need It Most</h2>
        
        <p class="mission-statement">
          At <span class="brand-name">CareMatch</span> we believe that everyone deserves high-quality, personalized care in the comfort of their own home. 
          Our mission is to bridge the gap between dedicated carers and the families or individuals who need their support. 
          Whether you're a professional carer seeking meaningful work or someone looking for trustworthy in-home assistance, 
          we're here to make the process simple, safe, and reliable.
        </p>
        
        <h2 class="section-title">Why Choose Us?</h2>
        
        <div class="audience-section">
          <h3 class="audience-title">For Families & Individuals:</h3>
          <ul class="benefits-list">
            <li>
              <strong>Personalized Matching</strong> 
              We carefully match you with carers who meet your specific needs, 
              whether it's elderly care, disability support, respite care, or companionship.
            </li>
            <li>
              <strong>Trust & Safety</strong> 
              All carers on our platform undergo thorough background checks and verification, 
              so you can feel confident in your choice.
            </li>
            <li>
              <strong>Flexible Solutions</strong> 
              From short-term assistance to long-term care, 
              we provide flexible options tailored to your lifestyle.
            </li>
          </ul>
        </div>
        
        <div class="audience-section">
          <h3 class="audience-title">For Carers:</h3>
          <ul class="benefits-list">
            <li>
              <strong>Rewarding Opportunities</strong> 
              Find fulfilling work with families who truly value your skills and compassion.
            </li>
            <li>
              <strong>Support & Growth</strong> 
              Access resources, training, and a supportive community to help you excel 
              in your caregiving career.
            </li>
            <li>
              <strong>Fair & Transparent</strong> 
              Set your own schedule, negotiate fair pay, and build lasting relationships 
              with those you care for.
            </li>
          </ul>
        </div>
        
        <h2 class="section-title">Our Story</h2>
        <p class="story-text">
            <span class="brand-name">CareMatch</span> was founded out of a passion for improving the caregiving experience for both carers and care recipients. 
            We saw the challenges families face in finding reliable, compassionate support and the difficulties carers encounter 
            in securing stable, rewarding work. Our platform was built to change that—creating a seamless, respectful, 
            and empowering connection between both sides.
        </p>
        
        <h2 class="section-title">Join Our Community</h2>
        <p class="join-text">
          Whether you're looking for care or looking to provide it, we invite you to become part of our growing network. 
          Together, we can redefine what it means to give and receive exceptional care.
        </p>
        
        <div class="cta-section">
          <p class="cta-text">
            <strong>Get started today—because everyone deserves care they can trust.</strong>
          </p>
        </div>
      </div>

      <!-- Back to top button -->
      <button 
        class="back-to-top" 
        :class="{ 'visible': showBackToTop }"
        @click="scrollToTop"
        aria-label="Back to top"
      >
        <span class="arrow-up">↑</span>
      </button>
    </div>
  </template>
  
  <script setup>
 import { ref, onMounted, onUnmounted } from 'vue';

// Reactive reference to control button visibility
const showBackToTop = ref(false);

// Function to scroll to top
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Function to check scroll position and show/hide button
const handleScroll = () => {
  // Show button when page is scrolled down 300px or more
  showBackToTop.value = window.scrollY > 300;
};

// Add and remove scroll event listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
  </script>
  
  <style scoped>
  .about-container {
    display: flex;
    justify-content: center;
    padding: 0px 20px;
    max-width: 100%;
    background-color: #fff;
    min-height: 100vh;
  }
  
  .about-content {
    max-width: 850px;
    width: 100%;
    background-color: white;
    border-radius: 12px;
   /* box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);*/
    padding: 40px;
  }
  
  .main-title {
    color: #4299e1;
    font-size: 3rem;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  
  .subtitle {
    color: #64748b;
    font-size: 1.5rem;
    margin-bottom: 3rem;
    text-align: center;
    font-weight: 400;
    line-height: 1.4;
    position: relative;
    padding-bottom: 1.5rem;
  }
  
  .subtitle::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background-color: #4299e1;
    border-radius: 3px;
  }
  
  .mission-statement {
    font-size: 1.15rem;
    line-height: 1.7;
    margin-bottom: 3rem;
    color: #334155;
    padding: 0 10px;
  }
  
  .brand-name {
    color: #3182ce;
    font-weight: bold;
  }
  
  .section-title {
    color: #1e293b;
    font-size: 2rem;
    margin: 3rem 0 1.5rem 0;
    padding-bottom: 0.75rem;
    position: relative;
    font-weight: 600;
  }
  
  .section-title::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background-color: #4299e1;
    border-radius: 3px;
  }
  
  .audience-section {
    margin-bottom: 2.5rem;
    background-color: #f8fafc;
    border-radius: 10px;
    padding: 25px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .audience-section:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
  }
  
  .audience-title {
    color: #2d3748;
    font-size: 1.35rem;
    margin-bottom: 1.25rem;
    font-weight: 600;
  }
  
  .benefits-list {
    list-style-type: none;
    padding-left: 0;
  }
  
  .benefits-list li {
    margin-bottom: 1.25rem;
    padding-left: 2rem;
    position: relative;
    line-height: 1.6;
  }
  
  .benefits-list li:before {
    content: "✓";
    color: #4299e1;
    font-size: 1.2rem;
    position: absolute;
    left: 0;
    top: 0;
    font-weight: bold;
  }
  
  .benefits-list li strong {
    color: #2d3748;
    font-weight: 600;
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .story-text, .join-text {
    line-height: 1.7;
    margin-bottom: 2rem;
    color: #334155;
    font-size: 1.05rem;
  }
  
  .cta-section {
    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
    border-radius: 10px;
    padding: 2.5rem;
    margin-top: 3rem;
    text-align: center;
    box-shadow: 0 10px 15px rgba(66, 153, 225, 0.2);
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .cta-section:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(66, 153, 225, 0.25);
  }
  
  .cta-text {
    color: white;
    font-size: 1.4rem;
    margin: 0;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .about-container {
      padding: 30px 15px;
    }
    
    .about-content {
      padding: 25px;
      border-radius: 8px;
    }
    
    .main-title {
      font-size: 2.2rem;
      margin-bottom: 1rem;
    }
    
    .subtitle {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      padding-bottom: 1.2rem;
    }
    
    .section-title {
      font-size: 1.6rem;
      margin: 2rem 0 1.2rem 0;
    }
    
    .audience-title {
      font-size: 1.2rem;
    }
    
    .benefits-list li, .story-text, .join-text {
      font-size: 1rem;
    }
    
    .cta-text {
      font-size: 1.2rem;
    }
    
    .audience-section {
      padding: 20px;
    }
    
    .cta-section {
      padding: 2rem;
    }
  }

  /* Back to top button styles */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #4299e1;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
}

.back-to-top:hover {
  background-color: #3182ce;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
}

.arrow-up {
  font-size: 24px;
  font-weight: bold;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .back-to-top {
    width: 40px;
    height: 40px;
    bottom: 20px;
    right: 20px;
  }
  
  .arrow-up {
    font-size: 20px;
  }
}
  </style>