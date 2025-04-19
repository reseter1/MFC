import { createContext, useContext, useState } from 'react';
import FullScreenLoader from '../components/FullScreenLoader';

const LoadingContext = createContext({
    isLoading: false,
    message: '',
    startLoading: () => { },
    stopLoading: () => { },
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [state, setState] = useState({
        isLoading: false,
        message: 'Đang xử lý...',
    });

    const startLoading = (message = 'Đang xử lý...') => {
        setState({ isLoading: true, message });
    };

    const stopLoading = () => {
        setState({ isLoading: false, message: '' });
    };

    return (
        <LoadingContext.Provider
            value={{
                isLoading: state.isLoading,
                message: state.message,
                startLoading,
                stopLoading,
            }}
        >
            {children}
            <FullScreenLoader isLoading={state.isLoading} />
        </LoadingContext.Provider>
    );
};

export default LoadingContext; 