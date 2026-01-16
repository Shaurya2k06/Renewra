/**
 * Oracle API Service
 * 
 * Fetches project data and NAV information from the Python oracle API.
 */

const API_BASE_URL = import.meta.env.VITE_ORACLE_API_URL || 'http://localhost:5001';

/**
 * Fetch all projects with their valuation data from the oracle.
 */
export async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data.projects || [];
    } catch (error) {
        console.error('Failed to fetch projects from oracle:', error);
        return null; // Return null to indicate fetch failure
    }
}

/**
 * Fetch a single project by ID.
 */
export async function fetchProjectById(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch project ${projectId}:`, error);
        return null;
    }
}

/**
 * Fetch current NAV and breakdown from the oracle.
 */
export async function fetchNav() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/nav`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch NAV from oracle:', error);
        return null;
    }
}

/**
 * Fetch fund metadata (cash, debt, supply, etc.)
 */
export async function fetchFundMetadata() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/fund`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch fund metadata:', error);
        return null;
    }
}

/**
 * Fetch PPA prices for all operational projects.
 */
export async function fetchPrices() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/prices`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data.prices || [];
    } catch (error) {
        console.error('Failed to fetch prices:', error);
        return null;
    }
}

/**
 * Check if the oracle API is available.
 */
export async function checkOracleHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    } catch {
        return false;
    }
}
