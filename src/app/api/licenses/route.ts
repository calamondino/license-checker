import { NextResponse } from "next/server";

type Dep = { name: string; version: string };

// npm registry endpoint: https://registry.npmjs.org/<pkg>/<version>
async function getLicense(pkg: string, version: string): Promise<string | null> {
  try {
    const url = `https://registry.npmjs.org/${pkg}/${version}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.license || data.licenses?.[0]?.type || null;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.deps || !Array.isArray(body.deps)) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const results = [];
  for (const dep of body.deps as Dep[]) {
    const license = await getLicense(dep.name, dep.version.replace(/^[\^~]/, ""));
    let risk: "green" | "yellow" | "red" | null = null;
    if (license) {
      if (["MIT", "Apache-2.0", "BSD"].includes(license)) risk = "green";
      else if (["GPL", "AGPL", "LGPL"].includes(license)) risk = "red";
      else risk = "yellow";
    }
    results.push({ ...dep, license: license ?? "unknown", risk });
  }

  return NextResponse.json({ deps: results });
}
