import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loggedIn: false,
    token: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.loggedIn = true;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.loggedIn = false;
            state.token = null;
        },
    },
});

export const { login, logout } = authSlice.actions;

export const selectLoggedIn = (state) => state.auth.loggedIn;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer; 