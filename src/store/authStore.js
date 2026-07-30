import { create } from 'zustand'
import {
  getAuthErrorMessage,
  loginWithEmail,
  logout as logoutWithFirebase,
  signUpWithEmail,
  subscribeAuthState,
} from '../firebase/authApi'
import { getUser } from '../firebase/userApi'

let unsubscribeAuthState = null

const loadUserProfile = async (user, throwOnError = false) => {
  if (!user) return { profile: null, isAdmin: false }

  try {
    const profile = await getUser(user)
    return { profile, isAdmin: profile.role === 'admin' }
  } catch (error) {
    if (throwOnError) throw error
    return { profile: null, isAdmin: false }
  }
}

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  error: '',

  initializeAuth: () => {
    if (unsubscribeAuthState) return unsubscribeAuthState

    unsubscribeAuthState = subscribeAuthState(async (user) => {
      if (!user) {
        set({ user: null, profile: null, isAdmin: false, loading: false })
        return
      }

      const { profile, isAdmin } = await loadUserProfile(user)
      set({ user, profile, isAdmin, loading: false })
    })

    return unsubscribeAuthState
  },

  login: async (email, password) => {
    set({ loading: true, error: '' })
    try {
      const user = await loginWithEmail({ email, password })
      const { profile, isAdmin } = await loadUserProfile(user)
      set({ user, profile, isAdmin, loading: false })
      return true
    } catch (error) {
      set({ error: getAuthErrorMessage(error) })
      return false
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email, password, nickname) => {
    set({ loading: true, error: '' })
    try {
      const user = await signUpWithEmail({ email, password, nickname })
      const { profile, isAdmin } = await loadUserProfile(user, true)
      set({ user, profile, isAdmin, loading: false })
      return true
    } catch (error) {
      set({ error: getAuthErrorMessage(error) })
      return false
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      await logoutWithFirebase()
    } catch (error) {
      set({ error: getAuthErrorMessage(error) })
      throw error
    }
  },
}))

export default useAuthStore
