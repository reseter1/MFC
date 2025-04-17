import { useSelector, useDispatch } from 'react-redux';
import { login, logout, selectLoggedIn, selectToken } from '../store/slices/authSlice';
import { useEffect, useState } from 'react';

export const useAuth = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectLoggedIn);
    const token = useSelector(selectToken);
    const [checkedToken, setCheckedToken] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            dispatch(login({ token }));
        } else {
            dispatch(logout());
        }
        setCheckedToken(true);
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
        checkedToken,
        loginUser,
        logoutUser,
    };
}; 