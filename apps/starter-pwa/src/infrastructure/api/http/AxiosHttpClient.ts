import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { injectable } from 'tsyringe';
import { IHttpClient, HttpResponse, HttpRequestConfig } from './IHttpClient';
import { ApiError } from '../errors/ApiError';

/**
 * Axios implementation of HTTP client
 * Follows Dependency Inversion Principle by implementing IHttpClient interface
 * Provides centralized HTTP error handling and configuration
 */
@injectable()
export class AxiosHttpClient implements IHttpClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for consistent error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        throw this.handleAxiosError(error);
      }
    );
  }

  async get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, this.toAxiosConfig(config));
    return this.toHttpResponse(response);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data, this.toAxiosConfig(config));
    return this.toHttpResponse(response);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data, this.toAxiosConfig(config));
    return this.toHttpResponse(response);
  }

  async delete<T = unknown>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url, this.toAxiosConfig(config));
    return this.toHttpResponse(response);
  }

  /**
   * Convert custom HttpRequestConfig to AxiosRequestConfig
   */
  private toAxiosConfig(config?: HttpRequestConfig): AxiosRequestConfig | undefined {
    if (!config) return undefined;

    return {
      headers: config.headers,
      timeout: config.timeout,
      params: config.params,
    };
  }

  /**
   * Convert AxiosResponse to HttpResponse
   */
  private toHttpResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  }

  /**
   * Handle Axios errors and convert to ApiError
   */
  private handleAxiosError(error: unknown): ApiError {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; statusText: string; data: unknown } };
      // Server responded with error status
      return new ApiError(
        `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
        axiosError.response.status,
        axiosError.response.data
      );
    } else if (error && typeof error === 'object' && 'request' in error) {
      // Network error - no response received
      return new ApiError(
        'Network error: Unable to connect to the API server',
        0,
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    } else {
      // Other error
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return new ApiError(
        message,
        0,
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }
}