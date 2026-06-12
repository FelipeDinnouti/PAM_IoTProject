const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchHistory(sensor, limit = 200) {
  try {
    const response = await fetch(`${API_URL}/api/history/${sensor}?limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return json.data || [];
  } catch (err) {
    console.warn(`[API] fetchHistory(${sensor}) falhou:`, err.message);
    return [];
  }
}

export async function fetchLatest() {
  try {
    const response = await fetch(`${API_URL}/api/latest`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('[API] fetchLatest falhou:', err.message);
    return null;
  }
}
