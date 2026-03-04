import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudyKit from './pages/StudyKit';
import Landing from './pages/Landing';
import authService from './services/authService';
import { ThemeProvider } from './components/ThemeProvider';

const PrivateRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

const PublicRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    
    if (user) {
        return <Navigate to="/dashboard" />;
    }
    
    return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/study-kit/:id" 
            element={
              <PrivateRoute>
                <StudyKit />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
