<template>
    <div class="app-layout">
      <!-- Show navbar on all pages except login and register -->
      <NavBar v-if="showNavbar" />
      
      <!-- Main content area -->
      <main class="content">
        <slot></slot>
      </main>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import NavBar from './NavBar.vue';
  
  export default {
    name: 'AppLayout',
    components: {
      NavBar
    },
    setup() {
      const route = useRoute();
      
      // Don't show navbar on login and register pages
      const showNavbar = computed(() => {
        const noNavbarRoutes = ['/', '/login', '/register'];
        return !noNavbarRoutes.includes(route.path);
      });
      
      return {
        showNavbar
      };
    }
  };
  </script>
  
  <style scoped>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .content {
    flex: 1;
    padding: 20px;
  }
  </style>