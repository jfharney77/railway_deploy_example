const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function fetchHello(): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/hello`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
