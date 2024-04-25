import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/dashboard';
import { LoginPage } from './pages/login';
import { Auth } from './components/auth';

export function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Auth>
              <DashboardPage />
            </Auth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}
