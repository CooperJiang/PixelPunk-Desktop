/**
 * API service configuration
 */

import type { ApiResponse } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * HTTP request wrapper
 */
async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: "GET" }),
  post: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
