import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import Home from '../components/Home.vue';
import JobseekerDashboard from '../components/JobseekerDashboard.vue';
import MyProfile from '../components/MyProfile.vue';
import JobSearch from '../components/JobSearch.vue'; 
import EmployerDashboard from '../components/EmployerDashboard.vue';
import JobPost from '../components/JobPost.vue';
import JobApplications from '../components/JobApplications.vue';
import EditJob from '../components/EditJob.vue';
import JobDetails from '../components/JobDetails.vue';
import About from '../components/About.vue'; // Import the About component

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: LoginForm },
  { path: '/register', component: RegisterForm },
  { path: '/jobseeker-dashboard', component: JobseekerDashboard, meta: { requiresAuth: true } },
  { path: '/my-profile', component: MyProfile, meta: { requiresAuth: true } },
  { path: '/job-search', component: JobSearch, meta: { requiresAuth: true } },
  { path: '/employer-dashboard', component: EmployerDashboard, meta: { requiresAuth: true } },
  { path: '/post-job', component: JobPost, meta: { requiresAuth: true, employerOnly: true } },
  { 
    path: '/job-applications/:id', 
    component: JobApplications, 
    meta: { requiresAuth: true, employerOnly: true } 
  },
  { 
    path: '/edit-job/:id', 
    component: EditJob, 
    meta: { requiresAuth: true, employerOnly: true } 
  },
  { 
    path: '/job-details/:id', 
    component: JobDetails, 
    meta: { requiresAuth: true } 
  },
  { path: '/about', component: About } // Added About route - no auth required
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