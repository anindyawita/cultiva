// Contoh fungsi fetch ke backend FastAPI
export async function getHello() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hello`);
  if (!res.ok) throw new Error("Gagal fetch data dari backend");
  return res.json();
}
