import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastMessage } from '../../types';

interface UiState {
  theme: 'dark';
  modals: {
    createUser: boolean;
    editUser: boolean;
    deleteUser: boolean;
    qrCode: boolean;
  };
  toast: ToastMessage[];
  currentQRKey: string | null;
}

const initialState: UiState = {
  theme: 'dark',
  modals: {
    createUser: false,
    editUser: false,
    deleteUser: false,
    qrCode: false,
  },
  toast: [],
  currentQRKey: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UiState['modals']] = false;
      });
    },
    showToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const id = Date.now().toString();
      state.toast.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toast = state.toast.filter((t) => t.id !== action.payload);
    },
    setQRKey: (state, action: PayloadAction<string | null>) => {
      state.currentQRKey = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  closeAllModals,
  showToast,
  removeToast,
  setQRKey,
} = uiSlice.actions;

export default uiSlice.reducer;
