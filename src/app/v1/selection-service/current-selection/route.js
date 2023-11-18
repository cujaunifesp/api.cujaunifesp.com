import { NextResponse } from "next/server";

import selectionQueryService from "src/services/selection/query";
import controller from "utils/controller";

export async function GET(request) {
  try {
    const currentSelection = await selectionQueryService.getCurrentSelection();

    return controller.response.ok(200, {
      ...currentSelection,
    });
  } catch (error) {
    return controller.response.error(error);
  }
}
