// app/page.tsx
export default function Home() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">license-checker</h1>
      <p className="opacity-80 mt-1">Liten Next-app for å vise dependencies.</p>

      <p className="mt-4">
        <a
          href="/deps"
          className="inline-block rounded-xl border px-4 py-2 hover:bg-gray-50"
        >
          ↳ Se dependency-tabell
        </a>
      </p>
    </main>
  );
}
