// İleride backend API çağrıları burada toparlanacak.
export async function http(path, { method = 'GET', headers, body } = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data?.message || 'İstek başarısız'));
  return data;
}
