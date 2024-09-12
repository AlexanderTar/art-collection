import { useAuthState } from '@/state/auth'

export { default as RequireIsAnonymous } from './RequireIsAnonymous'
export { default as RequireIsLoggedIn } from './RequireIsLoggedIn'

export const useAuth = () => useAuthState()[0]
