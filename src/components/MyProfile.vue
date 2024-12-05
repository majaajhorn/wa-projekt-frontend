<template>
    <div>
      <h1>My Profile</h1>
      <p>Here you can view and edit your profile details.</p>
      <!-- Add profile details and edit functionality here -->
      <button @click="goBack">Go Back</button>
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'MyProfile',
    setup() {
      const router = useRouter();
  
      const goBack = () => {
        router.back(); // Navigate back to the previous route
      };
  
      return {
        goBack,
      };
    },
  };
  </script>
  
  <style scoped>
/* Add styles for your profile page here */
button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
  