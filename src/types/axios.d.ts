import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Do not attach Bearer token (public endpoints). */
    skipAuth?: boolean;
    /** Suppress global error toast for this request. */
    skipErrorToast?: boolean;
    /** Internal: retry after refresh (interceptor). */
    _retry?: boolean;
  }
}
