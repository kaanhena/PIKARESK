import { http } from './http.js';

// Backend ayakta mı kontrolü (gerçek proje altyapısı)
export function healthCheck() {
  return http('/api/health');
}
