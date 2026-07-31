import { Navigate } from 'react-router-dom'
import Loading from './Loading'
import useAuthStore from '../store/authStore'

const AdminRoute = ({ children }) => {
  const isCheckingAccess = useAuthStore((state) => state.loading)
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (isCheckingAccess) {
    return <Loading>관리자 권한을 확인하고 있습니다...</Loading>
  }

  if (!currentUser) {
    return <Navigate to='/login' replace />
  }

  if (!isAdmin) {
    return <Navigate to='/' replace />
  }

  return <div className='admin-surface'>{children}</div>
}

export default AdminRoute
