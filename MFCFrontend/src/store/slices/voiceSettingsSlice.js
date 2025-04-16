import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    language: 'vi',
    voice: '1',
    speed: '1.0',
};

export const voiceSettingsSlice = createSlice({
    name: 'voiceSettings',
    initialState,
    reducers: {
        setVoiceSettings: (state, action) => {
            const { language, voice, speed } = action.payload;
            state.language = language;
            state.voice = voice;
            state.speed = speed;
        },
        setLanguage: (state, action) => {
            state.language = action.payload;
        },
        setVoice: (state, action) => {
            state.voice = action.payload;
        },
        setSpeed: (state, action) => {
            state.speed = action.payload;
        },
        resetVoiceSettings: (state) => {
            state.language = initialState.language;
            state.voice = initialState.voice;
            state.speed = initialState.speed;
        }
    },
});

export const {
    setVoiceSettings,
    setLanguage,
    setVoice,
    setSpeed,
    resetVoiceSettings
} = voiceSettingsSlice.actions;

export const selectVoiceSettings = (state) => state.voiceSettings;
export const selectLanguage = (state) => state.voiceSettings.language;
export const selectVoice = (state) => state.voiceSettings.voice;
export const selectSpeed = (state) => state.voiceSettings.speed;

export default voiceSettingsSlice.reducer; 