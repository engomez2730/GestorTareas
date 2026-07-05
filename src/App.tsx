import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { LoginPage } from './routes/LoginPage'
import { RegisterPage } from './routes/RegisterPage'
import { AppLayout } from './components/layout/AppLayout'
import { ReportsPage } from './features/reports/components/ReportsPage'
import { ProjectsPage } from './features/projects/components/ProjectsPage'
import { TasksPage } from './features/tasks/components/TasksPage'
import { PaymentsPage } from './features/payments/components/PaymentsPage'
import { UsersPage } from './features/users/components/UsersPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<ReportsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
