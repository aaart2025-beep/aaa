import { NextResponse } from "next/server";
import { readContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readContent());
}
