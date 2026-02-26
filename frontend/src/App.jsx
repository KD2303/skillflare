import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar, Footer, PageLoading } from './components';
import {
  Home,
  Login,
  Register,
  BrowseTasks,
  TaskDetails,
  Dashboard,
  Profile,
  EditProfile,
  Leaderboard,
  PostTask,
} from './pages';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import ApplyMentor from './pages/ApplyMentor';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout component
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-brand-dark transition-colors">
      <Navbar />
      <main className="flex-1 pt-20 lg:pt-24">{children}</main>
      <Footer />
    </div>
  );
};

// App Routes
const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/browse" element={<BrowseTasks />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/user/:id" element={<Profile />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-task"
          element={
            <ProtectedRoute>
              <PostTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentors"
          element={
            <ProtectedRoute>
              <Mentors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentors/apply"
          element={
            <ProtectedRoute>
              <ApplyMentor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentors/:id"
          element={
            <ProtectedRoute>
              <MentorProfile />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// Main App
const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
                success: {
                  iconTheme: {
                    primary: '#2E7D32',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#D32F2F',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
