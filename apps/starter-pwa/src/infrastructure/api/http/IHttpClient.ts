/**
 * HTTP Client Interface
 * Provides abstraction for HTTP operations following Dependency Inversion Principle
 * Allows easy mocking for tests and future HTTP library changes
 */

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, unknown>;
}

export interface IHttpClient {
  /**
   * Perform GET request
   */
  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * Perform POST request
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;

  /**
   * Perform PUT request
   */
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;

  /**
   * Perform DELETE request
   */
  delete<T = unknown>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
}