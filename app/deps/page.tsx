// app/deps/page.tsx
import React from "react";

type DepMap = Record<string, string> | undefined;

interface PackageJSON {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

// Importer package.json én gang og typ det
import pkgData from "../../package.json";
const pkg = pkgData as PackageJSON;

function Table({ title, data }: { title: string; data: DepMap }) {
  const entries = data ? Object.entries(data).sort(([a], [b]) => a.localeCompare(b)) : [];
  if (entries.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm opacity-70">Ingen</p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="overflow-x-auto mt-2">
        <table className="min-w-[480px] border border-gray-300">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Package</th>
              <th className="border px-2 py-1 text-left">Version Range</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, range]) => (
              <tr key={name}>
                <td className="border px-2 py-1 font-mono">{name}</td>
                <td className="border px-2 py-1 font-mono">{range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DepsPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Dependencies overview</h1>
      <p className="opacity-80 mt-1">
        Bygget direkte fra <code className="font-mono">package.json</code>.
      </p>

      <Table title="Dependencies" data={pkg.dependencies} />
      <Table title="Dev Dependencies" data={pkg.devDependencies} />
      <Table title="Peer Dependencies" data={pkg.peerDependencies} />
      <Table title="Optional Dependencies" data={pkg.optionalDependencies} />
    </main>
  );
}
