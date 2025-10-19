import { NextResponse } from "next/server";

import { scheduleMock } from "@/mocks/data/schedule";

export async function GET() {
  return NextResponse.json(scheduleMock);
}
