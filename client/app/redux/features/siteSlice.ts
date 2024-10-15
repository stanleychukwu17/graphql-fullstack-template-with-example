import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type siteDetailsType = {
    pageTransition: boolean
}

const initialState: siteDetailsType = {
    pageTransition: false,
};

// Creates the user slice
const siteSlice = createSlice({
    name: 'site',
    initialState,
    reducers: {
        setPageTransition: (state, action: PayloadAction<boolean>) => {
            state.pageTransition = action.payload;
        },
    },  
})

// Export the actions and reducer
export const { setPageTransition } = siteSlice.actions;
export default siteSlice.reducer;
