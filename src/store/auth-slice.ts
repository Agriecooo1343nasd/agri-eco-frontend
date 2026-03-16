import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession } from "@/lib/auth-types";

interface AuthState {
  session: AuthSession | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  session: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSession | null>) {
      state.session = action.payload;
      state.isInitialized = true;
    },
    clearSession(state) {
      state.session = null;
      state.isInitialized = true;
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
