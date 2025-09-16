"use client";
import { useState, useMemo } from "react";

type DepIn = { name: string; version: string };
type DepOut = DepIn & { license: string; risk: "green" | "yellow" | "red" | null };

export default function Home() {
  const [deps, setDeps] = useState<DepOut[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDeps([]);
    const file = e.target.files?.[0];
    if (!file) return;

    const isJson = file.name.toLowerCase().endsWith(".json");
    if (!isJson) {
      setError("Velg en package.json-fil 🙏");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(String(reader.result || "{}"));
        const d = {
          ...(json.dependencies || {}),
          ...(json.devDependencies || {}),
          ...(json.optionalDependencies || {}),
          ...(json.peerDependencies || {}),
        } as Record<string, string>;

        const arr: DepIn[] = Object.entries(d)
          .map(([name, version]) => ({ name, version }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setLoading(true);
        const res = await fetch("/api/licenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deps: arr }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Lisensoppslag feilet");
        setDeps(data.deps || []);
      } catch (err: any) {
        setError(err?.message || "Kunne ikke lese JSON / slå opp lisenser");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }

  const count = useMemo(() => deps.length, [deps]);

  return (
    <main className="min-h-dvh bg-black text-white flex flex-col items-center p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Dependency License Checker</h1>
        <p className="text-sm text-zinc-300 mb-6">
          Last opp <code className="bg-zinc-800 px-1 py-0.5 rounded">package.json</code> – vi
          henter lisensinfo fra npm registry og fargekoder risiko.
        </p>

        <label className="block border border-zinc-700 rounded-lg p-6 text-center cursor-pointer hover:bg-zinc-900">
          <input type="file" accept=".json,application/json" onChange={onFile} hidden />
          <div className="text-zinc-200">Klikk for å velge <b>package.json</b></div>
          <div className="text-xs text-zinc-400 mt-1">Data sendes kun til din egen /api-route.</div>
        </label>

        {loading && (
          <div className="mt-4 rounded bg-zinc-800 border border-zinc-700 p-3 text-zinc-200">
            Slår opp lisenser… ⏳
          </div>
        )}

        {error && (
          <div className="mt-4 rounded bg-red-900/40 border border-red-700 p-3 text-red-200">
            {error}
          </div>
        )}

        {count > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Avhengigheter</h2>
              <span className="text-sm text-zinc-400">{count} pakker</span>
            </div>
            <div className="overflow-x-auto rounded border border-zinc-800">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-900/60">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-zinc-300">Pakke</th>
                    <th className="text-left px-3 py-2 font-medium text-zinc-300">Versjon</th>
                    <th className="text-left px-3 py-2 font-medium text-zinc-300">Lisens</th>
                  </tr>
                </thead>
                <tbody>
                  {deps.map((d) => (
                    <tr key={d.name} className="odd:bg-zinc-900/30">
                      <td className="px-3 py-2 font-mono">{d.name}</td>
                      <td className="px-3 py-2 font-mono text-zinc-300">{d.version}</td>
                      <td
                        className={`px-3 py-2 font-mono ${
                          d.risk === "green"
                            ? "text-green-400"
                            : d.risk === "red"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {d.license}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Neste steg: lagre “scans” i database + eksport til CSV/PDF.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
