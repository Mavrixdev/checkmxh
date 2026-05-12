import { useSystemStore } from '../stores/system-store';

export const API_TIMEOUT = 10000;

export async function checkApiHealth(url: string): Promise<boolean> {
  if (!url) return false;
  
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  let healthUrl = `${cleanUrl}/api/public-settings`;
  
  // Handle Mixed Content (HTTPS -> HTTP) via Proxy
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && healthUrl.startsWith('http://')) {
    healthUrl = `/api/proxy?url=${encodeURIComponent(healthUrl)}`;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error: any) {
    return false;
  }
}

export async function syncSystemState() {
  const store = useSystemStore.getState();
  const { apiUrl, setupCompleted, lastConnectionCheck } = store;
  
  // 1. Skip if setup not completed
  if (!setupCompleted || !apiUrl) {
    store.setSystemState('setup');
    return;
  }

  // 2. RATE LIMIT: Only check if more than 30 seconds have passed since last check
  const now = Date.now();
  if (now - lastConnectionCheck < 30000 && store.systemState !== 'setup') {
    return;
  }

  // 3. Skip obvious placeholder URLs
  if (apiUrl === 'http://localhost' || apiUrl === 'localhost' || apiUrl === '[IP_ADDRESS]') {
    store.setApiConnected(false);
    store.setSystemState('offline');
    store.updateLastCheck();
    return;
  }
  
  // If we were in setup, move to connecting
  if (store.systemState === 'setup') {
    store.setSystemState('connecting');
  }
  
  const isHealthy = await checkApiHealth(apiUrl);
  
  if (isHealthy) {
    store.setApiConnected(true);
    store.setSystemState('online');
  } else {
    store.setApiConnected(false);
    store.setSystemState('offline');
  }
  
  store.updateLastCheck();
}
