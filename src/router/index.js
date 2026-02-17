import { createRouter, createWebHistory } from 'vue-router'

const Portfolio = () => import('../views/Portfolio.vue')
const BlogHome = () => import('../views/BlogHome.vue')
const BlogPost = () => import('../views/BlogPost.vue')

const routes = [
  { path: '/', name: 'home', component: Portfolio },
  { path: '/blog', name: 'blog', component: BlogHome },
  { path: '/blog/:slug', name: 'blog-post', component: BlogPost },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
