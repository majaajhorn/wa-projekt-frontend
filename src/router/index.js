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
import About from '../components/About.vue';
import BrowseCarers from '../components/BrowseCarers.vue';
import ApplicationDetails from '../components/ApplicationDetails.vue';
import ApplyJob from '../components/ApplyJob.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: LoginForm },
  { path: '/register', component: RegisterForm },
  { path: '/jobseeker-dashboard', component: JobseekerDashboard, meta: { requiresAuth: true } },
  { path: '/my-profile', component: MyProfile, meta: { requiresAuth: true } },
  { path: '/job-search', component: JobSearch, meta: { requiresAuth: true } },
  { path: '/employer-dashboard', component: EmployerDashboard, meta: { requiresAuth: true } },
  { path: '/post-job', component: JobPost, meta: { requiresAuth: true, employerOnly: true } },
  { path: '/job-applications/:id', component: JobApplications, meta: { requiresAuth: true, employerOnly: true } },
  { path: '/edit-job/:id', component: EditJob, meta: { requiresAuth: true, employerOnly: true } },
  { path: '/job-details/:id', component: JobDetails, meta: { requiresAuth: true } },
  { path: '/about', component: About }, // No auth required
  { path: '/application-details/:id', component: ApplicationDetails, meta: { requiresAuth: true } },
  { path: '/apply-job/:id', component: ApplyJob, meta: { requiresAuth: true } },
  
  // Modified BrowseCarers route to handle both public and authenticated access
  { path: '/browse-carers', component: BrowseCarers, meta: { requiresAuthForEmployers: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global route guard to protect authenticated routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // Get token from localStorage
  const userRole = localStorage.getItem('userRole'); // Get user role from localStorage

  // Handle browse-carers route specially
  if (to.path === '/browse-carers') {
    // If not logged in, allow access (public preview)
    if (!token) {
      next();
    } 
    // If logged in as employer, allow access
    else if (userRole === 'employer') {
      next();
    }
    // If logged in as jobseeker, redirect to dashboard
    else {
      next('/jobseeker-dashboard');
    }
  }
  // Standard auth check for other routes
  else if (to.meta.requiresAuth && !token) {
    next('/login'); // Redirect to login page
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