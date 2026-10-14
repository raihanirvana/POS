export async function getHealth(signal) {
  const response = await fetch('/api/health', { signal, cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Backend belum bisa dihubungi. Pastikan server API berjalan.');
  }
  return response.json();
}
