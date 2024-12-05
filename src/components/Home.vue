<template>
  <div>
    <h1>Welcome to the App!</h1>
    <router-link to="/login">Go to Login</router-link> <br />
    <!-- Add link to Register page -->
    <router-link to="/register">Go to Register</router-link>
  </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>
