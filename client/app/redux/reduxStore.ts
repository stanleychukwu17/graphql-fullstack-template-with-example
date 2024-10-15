import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userSlice from './features/userSlice';
import siteSlice from './features/siteSlice';

const rootReducer = combineReducers({
    user: userSlice,
    site: siteSlice,
});

const store = configureStore({
    reducer: rootReducer,
});

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch