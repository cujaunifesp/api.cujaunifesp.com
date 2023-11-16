import { NextResponse } from "next/server";

import emailVerificationService from "src/services/auth/email-verification";

export async function POST(request) {
  try {
    const requestBody = await request.json();
    await emailVerificationService.startEmailVerification(requestBody.email);
    return NextResponse.json({
      message: "Código de verificação enviado com sucesso",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: "Não foi possível realizar a verificação desse email",
        },
      },
      { status: 500 },
    );
  }
}
