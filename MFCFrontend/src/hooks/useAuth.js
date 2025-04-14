import { useSelector, useDispatch } from 'react-redux';
import { login, logout, selectLoggedIn, selectToken } from '../store/slices/authSlice';
import { useEffect } from 'react';

export const useAuth = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectLoggedIn);
    const token = useSelector(selectToken);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            dispatch(login({ token }));
        }
    }, [dispatch]);

    const loginUser = (token) => {
        dispatch(login({ token }));
        localStorage.setItem('access_token', token);
    };

    const logoutUser = () => {
        dispatch(logout());
        localStorage.removeItem('access_token');
    };

    return {
        isLoggedIn,
        token,
        loginUser,
        logoutUser,
    };
}; 