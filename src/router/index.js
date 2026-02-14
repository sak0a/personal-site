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
      path: '/2',
      component: () => import('../views/Version2.vue'),
    },
    {
      path: '/3',
      component: () => import('../views/Version3.vue'),
    },
    {
      path: '/4',
      component: () => import('../views/Version4.vue'),
    },
    {
      path: '/5',
      component: () => import('../views/Version5.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
