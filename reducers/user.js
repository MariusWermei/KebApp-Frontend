import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    token: null,
    username: null,
    email: null,
    avatar: null,
    preferences: [],
    hasOnboarded: false,
  },
  reducers: {
    setUser: (state, action) => {
      console.log("Reducer setUser reçoit:", action.payload);
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.avatar = action.payload.avatar;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      console.log("Token reducer =>", state.token);
    },
    setPreferences: (state, action) => {
      state.preferences = action.payload;
      console.log("Preferences reducer =>", state.preferences);
    },
    setHasOnboarded: (state) => {
      state.hasOnboarded = true;
      console.log("Has onboarded from reducer =>", state.hasOnboarded);
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.email = null;
      state.avatar = null;
      console.log("Token reducer =>", state.token);
      // On ne reset PAS hasOnboarded — même après un logout,
      // l'utilisateur ne doit pas revoir l'onboarding
    },
    // Reset Onboarding spécialement pour la période de développement, permet de reset le store persistant
    // A SUPPRIMER POUR LE MVP DE FIN
    resetOnboarding: (state) => {
      state.token = null;
      state.preferences = [];
      state.hasOnboarded = false;
    },
  },
});

export const {
  setToken,
  setUser,
  setPreferences,
  setHasOnboarded,
  logout,
  resetOnboarding,
} = userSlice.actions;
export default userSlice.reducer;
