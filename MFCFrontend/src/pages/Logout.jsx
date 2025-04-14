import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { API_URL } from "../data/constant";

export default function Logout() {
    const { logoutUser } = useAuth();
    const isCalled = useRef(false);
    
    useEffect(() => {
        if (isCalled.current) return;
        isCalled.current = true;
        
        const logout = async () => {
            try {
                const token = localStorage.getItem('access_token');
                await fetch(`${API_URL}/logout`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error(error);
            } finally {
                logoutUser();
            }
        };
        logout();
    }, [logoutUser]);

    return <Navigate to="/sign-in" />;
}