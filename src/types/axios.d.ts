import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Do not attach Bearer token (public endpoints). */
    skipAuth?: boolean;
    /** Suppress global error toast for this request. */
    skipErrorToast?: boolean;
    /** Show toast when this request fails with 401/403 (default: silent). */
    showAuthErrorToast?: boolean;
    /** Internal: retry after refresh (interceptor). */
    _retry?: boolean;
  }
}
