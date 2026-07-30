import { Navigate } from 'react-router-dom'
import Loading from './Loading'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ children }) => {
  const isCheckingAuth = useAuthStore((state) => state.loading)
  const currentUser = useAuthStore((state) => state.user)

  // Firebase가 새로고침 후 저장된 로그인 상태를 복원할 때까지는 이동하지 않습니다.
  if (isCheckingAuth) {
    return <Loading>인증 정보를 확인하고 있습니다...</Loading>
  }

  if (!currentUser) {
    return <Navigate to='/login' replace />
  }

  return children
}

export default ProtectedRoute
