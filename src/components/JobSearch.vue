<template>
    <div class="container">
      <h1>Job Search</h1>
  
      <!-- Search Bar -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a job..."
        class="search-bar"
      />
  
      <!-- Filters -->
      <div class="filters">
        <label>
          Gender:
          <select v-model="filters.gender">
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
  
        <label>
          Location:
          <input v-model="filters.location" type="text" placeholder="Enter location" />
        </label>
  
        <label>
          English Level:
          <select v-model="filters.englishLevel">
            <option value="">Any</option>
            <option value="basic">Very Basic</option>
            <option value="intermediate">Conversational</option>
            <option value="fluent">Fluent</option>
          </select>
        </label>
  
        <label>
          Live-in Care Experience:
          <select v-model="filters.careExperience">
            <option value="">Any</option>
            <option value="Less than a year">Less than a year</option>
            <option value="1-3 years">1-3 years</option>
            <option value="4-6 years">4-6 years</option>
            <option value="More than 6 years">More than 6 years</option>
          </select>
        </label>
  
        <label>
          Driving License:
          <select v-model="filters.drivingLicense">
            <option value="">Any</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
  
        <label>
          Care Qualifications:
          <select v-model="filters.careQualifications">
            <option value="">Any</option>
            <option value="medical_surgical">Medical/Surgical</option>
            <option value="nursing">Nursing</option>
            <option value="nvq_health_social_care">NVQ Health and Social Care</option>
            <option value="occupational_therapy">Occupational Therapy</option>
            <option value="other">Other</option>
          </select>
        </label>
  
        <label>
          Salary Range:
          <input v-model.number="filters.salaryFrom" type="number" placeholder="From" />
          <input v-model.number="filters.salaryTo" type="number" placeholder="To" />
        </label>
      </div>
  
      <!-- Back to Dashboard -->
      <button @click="$router.push('/jobseeker-dashboard')">Back to Dashboard</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const searchQuery = ref('');
  const filters = ref({
    gender: '',
    location: '',
    englishLevel: '',
    careExperience: '',
    drivingLicense: '',
    careQualifications: '',
    salaryFrom: null,
    salaryTo: null,
  });
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    text-align: center;
  }
  
  .search-bar {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .filters {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: left;
  }
  
  .filters label {
    display: flex;
    flex-direction: column;
    font-weight: bold;
  }
  
  .filters input,
  .filters select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #42b883;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #389a6e;
  }
  </style>
  