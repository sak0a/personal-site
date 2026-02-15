import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/VersionChooser.vue'),
    },
    {
      path: '/1',
      component: () => import('../views/Version1.vue'),
    },
    {
      path: '/4',
      component: () => import('../views/Version4.vue'),
    },
    {
      path: '/5',
      component: () => import('../views/Version5.vue'),
    },
    {
      path: '/55',
      component: () => import('../views/Version55.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
