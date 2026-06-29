import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const TARGETS_FILE = path.join(process.cwd(), "hermes", "competitive-intel", "templates", "targets.json")

export async function GET() {
  try {
    const raw = fs.readFileSync(TARGETS_FILE, "utf-8")
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ github: [], news: [] })
  }
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Read-only in production. Edit targets.json locally and push." }, { status: 403 })
  }
  try {
    const body = await req.json()
    fs.writeFileSync(TARGETS_FILE, JSON.stringify(body, null, 2), "utf-8")
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
