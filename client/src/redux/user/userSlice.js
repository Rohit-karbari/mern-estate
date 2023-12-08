import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    error: null,
    loading: false
}

const userSlice = createSlice ({
    name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
        },
        signInSuccess : (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null
        },
        signInFaliur: (state, action) => {
            state.currentUser = action.payload
            state.loading = false
            state.error = action.payload
        }
    }
})

export const { signInStart, signInSuccess, signInFaliur} = userSlice.actions;

export default userSlice.reducer;