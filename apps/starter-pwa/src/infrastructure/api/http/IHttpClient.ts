/**
 * HTTP Client Interface
 * Provides abstraction for HTTP operations following Dependency Inversion Principle
 * Allows easy mocking for tests and future HTTP library changes
 */

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
}

export interface IHttpClient {
  /**
   * Perform GET request
   */
  get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * Perform POST request
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;

  /**
   * Perform PUT request
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;

  /**
   * Perform DELETE request
   */
  delete<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
}