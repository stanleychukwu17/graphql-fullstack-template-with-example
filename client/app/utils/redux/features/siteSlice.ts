import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { urlMap } from "../../url-mappings";

type siteDetailsType = {
    urlBeforeLogin: string;
    pageTransition: boolean;
}

const initialState: siteDetailsType = {
    urlBeforeLogin: urlMap.home,
    pageTransition: false,
};

// Creates the user slice
const siteSlice = createSlice({
    name: 'site',
    initialState,
    reducers: {
        // we want to navigate the user back to this link after they log in
        updateUrlBeforeLogin: (state, action: PayloadAction<string>) => {
            state.urlBeforeLogin = action.payload;
        },

        setPageTransition: (state, action: PayloadAction<boolean>) => {
            state.pageTransition = action.payload;
        },
    },  
})

// Export the actions and reducer
export const {
    setPageTransition, updateUrlBeforeLogin
} = siteSlice.actions;
export default siteSlice.reducer;
