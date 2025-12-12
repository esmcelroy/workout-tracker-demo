/**
 * API Service Layer
 * 
 * Fetch-based HTTP client for backend communication.
 * Provides generic functions for CRUD operations.
 */

// Get the API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Retrieve data for a key from the backend
 * @param key - The storage key to retrieve
 * @returns The data for the key, or null if not found
 */
export async function apiGet<T>(key: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${key}`);
    
    if (response.status === 404) {
      // Key doesn't exist, return null
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data as T;
  } catch (error) {
    console.error(`Failed to get ${key}:`, error);
    return null;
  }
}

/**
 * Store or update data for a key in the backend
 * @param key - The storage key to set
 * @param value - The data to store
 * @returns The stored data
 */
export async function apiSet<T>(key: string, value: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: value }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data as T;
  } catch (error) {
    console.error(`Failed to set ${key}:`, error);
    throw error;
  }
}

/**
 * Delete data for a key from the backend
 * @param key - The storage key to delete
 */
export async function apiDelete(key: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${key}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Failed to delete ${key}:`, error);
    throw error;
  }
}

/**
 * List all keys stored in the backend
 * @returns Array of all storage keys
 */
export async function apiListKeys(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/keys`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.keys as string[];
  } catch (error) {
    console.error('Failed to list keys:', error);
    return [];
  }
}

/**
 * Export all data from the backend
 * @returns All data as a JSON object
 */
export async function apiExport(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${API_BASE_URL}/export`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data as Record<string, unknown>;
  } catch (error) {
    console.error('Failed to export data:', error);
    return {};
  }
}

/**
 * Import data into the backend
 * @param data - Data to import as a JSON object
 */
export async function apiImport(data: Record<string, unknown>): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
}
