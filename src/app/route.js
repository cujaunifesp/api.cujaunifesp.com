import { NextResponse } from "next/server";

export async function GET(request) {
  return NextResponse.redirect(new URL("www.cujaunifesp.com", request.url));
}
