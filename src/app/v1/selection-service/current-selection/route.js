import { NextResponse } from "next/server";

import selectionQueryService from "src/services/selection/query";

export async function GET(request) {
  const currentSelection = await selectionQueryService.getCurrentSelection();
  return NextResponse.json({
    ...currentSelection,
  });
}

export const revalidate = 300;
