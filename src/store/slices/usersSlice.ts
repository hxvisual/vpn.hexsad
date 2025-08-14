import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersApi } from '../../services/endpoints';
import {
  User,
  UserFilters,
  PaginationState,
  CreateUserDto,
  UpdateUserDto,
} from '../../types';

interface UsersState {
  list: User[];
  selectedUser: User | null;
  filters: UserFilters;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  selectedUser: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ filters, pagination }: { filters?: UserFilters; pagination?: Partial<PaginationState> }) => {
    const response = await usersApi.getUsers(filters, pagination);
    return response;
  }
);

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id: string) => {
    const response = await usersApi.getUser(id);
    return response;
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserDto) => {
    const response = await usersApi.createUser(userData);
    return response;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string; userData: UpdateUserDto }) => {
    const response = await usersApi.updateUser(id, userData);
    return response;
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string) => {
    await usersApi.deleteUser(id);
    return id;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Fetch single user
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      // Create user
      .addCase(createUser.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // Update user
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      });
  },
});

export const { setFilters, setPagination, setSelectedUser, clearSelectedUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;
