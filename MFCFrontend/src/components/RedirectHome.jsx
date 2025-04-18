import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function RedirectHome({ children }) {
    const { isLoggedIn } = useAuth();
    if (isLoggedIn) {
        return <Navigate to="/chat" />;
    }
    return children;
}