import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import NewApp from './pages/NewApp'
import AppView from './pages/AppView'
import Settings from './pages/Settings'

export const router = createBrowserRouter([
  { path: '/',     element: <Landing /> },
  { path: '/auth', element: <Auth /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard',  element: <Dashboard /> },
      { path: '/new',        element: <NewApp /> },
      { path: '/apps/:id',   element: <AppView /> },
      { path: '/settings',   element: <Settings /> },
    ]
  }
])
