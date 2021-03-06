import Vue from 'vue'
import Constants from '../boot/constants'
import { Loading } from 'quasar'
const isAuthorized = () => {
  let i = 0
  return new Promise((resolve, reject) => {
    const waitToPopulate = (delay = 100) => {
      i += 1
      if (i >= 300) resolve(Constants.unauthorized)

      const status = Vue.prototype.$store.getters['user/getStatus']
      if (status) resolve(status)
      else setTimeout(waitToPopulate, delay)
    }
    waitToPopulate()
  })
}

const routes = [
  {
    path: '/',
    redirect: { name: 'auth' }
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem(Constants.token)) next({ name: 'home' })
      else next()
    },
    children: [
      { path: '/', name: 'auth', component: () => import('pages/auth/Login.vue') },
      { path: '/provider', name: 'social-provider', component: () => import('pages/auth/Provider.vue') },
      { path: '/register', name: 'auth-register', component: () => import('pages/auth/Register.vue') }
    ]
  },
  {
    path: '/profile',
    component: () => import('layouts/ProfileLayout.vue'),
    children: [
      { path: ':id', name: 'profile', component: () => import('pages/profile/public.vue'), props: true }
    ]
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: async (to, from, next) => {
      try {
        if (!localStorage.getItem(Constants.token)) next({ name: 'auth' })
        else {
          if (localStorage.getItem(Constants.provider)) localStorage.removeItem(Constants.provider)
          else Loading.show()
          const status = await isAuthorized()
          if (status !== Constants.authorized) {
            localStorage.removeItem(Constants.token)
            next({ name: 'auth' })
          } else { next() }
          Loading.hide()
        }
      } catch (e) {
        console.error(e)
      }
    },
    children: [
      { path: '/', name: 'home', component: () => import('pages/Index.vue') },
      { path: '/settings', name: 'settings', component: () => import('pages/me/Settings') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    name: 'error',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
