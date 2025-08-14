import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { fetchCurrentUser } from './store/slices/authSlice';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Toast } from './components/common/Toast';
import './App.css';

function AppContent() {
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Set dark theme by default
    document.documentElement.classList.add('dark');
    
    // Auto-login if token exists but user is not loaded
    if (token && !user && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user, isLoading]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            // Redirect to profile if already authenticated
            user ? <Navigate to="/profile" replace /> : <LoginPage />
          } 
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
      <Toast />
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
