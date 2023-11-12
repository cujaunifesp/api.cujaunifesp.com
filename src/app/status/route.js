import { NextResponse } from "next/server";

import database from "infra/db/database.mjs";

export async function GET(request) {
  const result = await database.query("SELECT 1+1;");
  return NextResponse.json({
    message: "Conexão com banco de dados estabelecida com sucesso.",
  });
}
