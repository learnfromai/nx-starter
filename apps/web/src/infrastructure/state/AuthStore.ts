import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { container, TOKENS } from '../di/container';
import { LoginUserCommand } from '@nx-starter/application-shared';
import type { AuthStore } from './AuthStoreInterface';
import type { IAuthCommandService } from '@nx-starter/application-shared';

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => {
        // Lazy resolve CQRS services - proper separation of concerns
        const getCommandService = () =>
          container.resolve<IAuthCommandService>(TOKENS.AuthCommandService);

        return {
          // Initial state
          isAuthenticated: false,
          user: null,
          token: null,
          loginStatus: 'idle',
          error: null,

          // Computed values as functions
          getAuthHeaders(): Record<string, string> {
            const { token } = get();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },

          // Actions
          async login(credentials: { identifier: string; password: string }, rememberMe = false) {
            set((state) => {
              state.loginStatus = 'loading';
              state.error = null;
            });

            try {
              const command: LoginUserCommand = {
                identifier: credentials.identifier,
                password: credentials.password,
              };

              const response = await getCommandService().login(command);

              set((state) => {
                state.isAuthenticated = true;
                state.user = response.user;
                state.token = response.token;
                state.loginStatus = 'success';
                state.error = null;
              });

              // Store token in localStorage only if rememberMe is true
              if (rememberMe && typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('auth_user', JSON.stringify(response.user));
              }
            } catch (error: any) {
              set((state) => {
                state.loginStatus = 'error';
                state.error = error.message || 'Invalid email/username or password';
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
              });
            }
          },

          logout() {
            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
              state.token = null;
              state.loginStatus = 'idle';
              state.error = null;
            });

            // Clear localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
            }
          },

          clearError() {
            set((state) => {
              state.error = null;
            });
          },

          setToken(token: string) {
            set((state) => {
              state.token = token;
              state.isAuthenticated = true;
            });
          },

          checkAuthState() {
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('auth_token');
              const userJson = localStorage.getItem('auth_user');
              
              if (token && userJson) {
                try {
                  const user = JSON.parse(userJson);
                  set((state) => {
                    state.isAuthenticated = true;
                    state.user = user;
                    state.token = token;
                  });
                } catch (error) {
                  // Invalid stored data, clear it
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('auth_user');
                }
              }
            }
          },
        };
      }),
      {
        name: 'auth-store',
      }
    )
  )
);