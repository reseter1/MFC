import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn';
import { APP_NAME } from './data/constant';
import { useEffect } from 'react';
import NotFound from './pages/404';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import ActivationAccount from './pages/ActivationAccount';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectHome from './components/RedirectHome';
import Logout from './pages/Logout';

function App() {
  useEffect(() => {
    document.title = `Reseter | ${APP_NAME}`
  }, [])

  return (
      <Router>
        <Routes>
          <Route path="/sign-in" element={<RedirectHome children={<SignIn />} />} />
          <Route path="/sign-up" element={<RedirectHome children={<SignUp />} />} />
          <Route path="/forgot-password" element={<RedirectHome children={<ForgotPassword />} />} />
          <Route path="/change-password" element={<RedirectHome children={<ChangePassword />} />} />
          <Route path="/activate" element={<RedirectHome children={<ActivationAccount />} />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
  )
}

export default App
