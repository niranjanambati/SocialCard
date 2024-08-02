import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  hasUsername: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setHasUsername: (state, action) => {
      state.hasUsername = action.payload;
    },
  },
});

export const { setUser, setHasUsername } = userSlice.actions;

export const selectHasUsername = (state) => state.user.hasUsername;
export const selectUser = (state) => state.user.user;

export default userSlice.reducer;