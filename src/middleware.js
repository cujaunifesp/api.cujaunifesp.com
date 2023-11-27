import { NextResponse } from "next/server";

export function middleware(request) {
  if (request.method === "OPTIONS") {
    return NextResponse.json("ok", { status: 200 });
  }

  return NextResponse.next();
}
