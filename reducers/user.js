import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    token: null,
    preferences: [],
    hasOnboarded: false,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setPreferences: (state, action) => {
      state.preferences = action.payload;
    },
    setHasOnboarded: (state) => {
      state.hasOnboarded = true;
      console.log("Has onboarded from reducer =>", state.hasOnboarded);
    },
    logout: (state) => {
      state.token = null;
      console.log("Token reducer =>", state.token);
      state.preferences = [];
      // On ne reset PAS hasOnboarded — même après un logout,
      // l'utilisateur ne doit pas revoir l'onboarding
    },
  },
});

export const { setToken, setPreferences, setHasOnboarded, logout } =
  userSlice.actions;
export default userSlice.reducer;
