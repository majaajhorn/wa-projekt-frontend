import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import Home from '../components/Home.vue';
import JobseekerDashboard from '../components/JobseekerDashboard.vue';
import MyProfile from '../components/MyProfile.vue';
import JobSearch from '../components/JobSearch.vue'; 
import EmployerDashboard from '../components/EmployerDashboard.vue';
import JobPost from '../components/JobPost.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: LoginForm },
  { path: '/register', component: RegisterForm },
  { path: '/jobseeker-dashboard', component: JobseekerDashboard, meta: { requiresAuth: true } }, // Fixed syntax
  { path: '/my-profile', component: MyProfile, meta: { requiresAuth: true } }, // Fixed syntax
  { path: '/job-search', component: JobSearch, meta: { requiresAuth: true } },
  { path: '/employer-dashboard', component: EmployerDashboard, meta: { requiresAuth: true } },
  { path: '/post-job', component: JobPost, meta: { requiresAuth: true, employerOnly: true } },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global route guard to protect authenticated routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // Get token from localStorage
  const userRole = localStorage.getItem('userRole'); // Get user role from localStorage

  // If the route requires auth and there's no token, redirect to home
  if (to.meta.requiresAuth && !token) {
    next('/'); // Redirect to home (login page)
  } 
  // If the route is for employers only and user is not an employer, redirect to dashboard
  else if (to.meta.employerOnly && userRole !== 'employer') {
    next('/jobseeker-dashboard'); // Redirect to appropriate dashboard
  }
  else {
    next(); // Proceed to the route
  }
});

export default router;

  /* Explanation
meta.requiresAuth:

In the /jobseeker-dashboard route, the meta property is used to mark the route as requiring authentication.
This makes it easy to identify which routes should be protected.
beforeEach Route Guard:

The router.beforeEach hook runs before navigating to any route.
It checks if the target route (to) has meta.requiresAuth set to true and whether the user has a valid token in localStorage.
If the token is missing (i.e., the user is not logged in), the guard redirects them to the home page (/).
Preventing Back Navigation:

After logging out, when the token is removed from localStorage, any attempt to access protected routes (even via the browser back button) will fail because the guard will redirect unauthenticated users to the home page.*/ 