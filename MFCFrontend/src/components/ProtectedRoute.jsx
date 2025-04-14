import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectLoggedIn } from '../store/slices/authSlice';

export default function ProtectedRoute({ children }) {
    const isLoggedIn = useSelector(selectLoggedIn);
    if (!isLoggedIn) {
        return <Navigate to="/sign-in" replace />;
    }

    return children;
} 