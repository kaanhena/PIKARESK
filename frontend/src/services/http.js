// Backend API cagirilari burada toplanir.
const apiBase = import.meta.env.VITE_API_BASE_URL || '';

function resolveUrl(path) {
  if (!path) return apiBase || '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!apiBase) return path;
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function http(path, { method = 'GET', headers, body } = {}) {
  const res = await fetch(resolveUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data?.message || 'Istek basarisiz'));
  return data;
}
