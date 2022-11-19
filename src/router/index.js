import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home'

import store from '@/store'
import axios from 'axios'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'home',
    component: Home,
  },
  {
    path: '/map/:id',
    name: 'map',
    component: () => import(/* webpackChunkName: "map" */ '@/views/Map'),
  },
  {
    path: '/login',
    beforeEnter: async (to, from, next) => {
      try {
        await axios.post(process.env.VUE_APP_BACKEND_URL + '/login', '', {
          withCredentials: true,
        })
        await store.dispatch('auth/whoami')
      } catch (error) {
        await store.dispatch('ui/pushFlashQueue', {
          content: 'Login failed',
          type: 'error',
        })
        console.log(error)
      } finally {
        next('/')
      }
    },
  },
  // {
  //   path: '/callback/spotify', --> use to.query.code to get the auth code
  // },
  {
    path: '*',
    name: 'catchall',
    redirect: '/home',
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

const LOGIN_PATHS = ['login', 'callback']

router.beforeEach(async (to, from, next) => {
  if (LOGIN_PATHS.some((path) => to.path.includes(path))) {
    next()
  } else {
    if (!store.state.auth.user) {
      await store.dispatch('auth/whoami')
      if (!store.state.auth.user) {
        return next('/login')
      }
    }

    next()
  }
})

export default router
