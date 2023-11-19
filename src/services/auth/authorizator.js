import jwt from "jsonwebtoken";

import selectionFeatures from "src/app/v1/selection-service/features";
import { ForbiddenError, UnauthorizedError } from "utils/errors";

const features = {
  ...selectionFeatures,
};

function token(token) {
  let session;

  if (token) {
    try {
      session = jwt.verify(token, process.env.JWT_SIGNER_KEY);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedError({
        message: "Você está tentando usar um token inválido.",
      });
    }
  } else {
    session = { role: "unauthenticated" };
  }

  async function can(featureTitle, options) {
    const { allowUnauthenticated, verifier } = features[featureTitle];

    if (!allowUnauthenticated && session.role === "unauthenticated") {
      throw new UnauthorizedError({});
    }

    const passed = await verifier(session, options?.resource);

    if (!passed) {
      throw new ForbiddenError({});
    }

    return;
  }

  return {
    can,
  };
}

function request(headers) {
  const requestHeaders = new Headers(headers);
  const authHeader = requestHeaders.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const userToken = authHeader.substring(7);
    console.log(userToken, authHeader);
    return token(userToken);
  } else {
    return token();
  }
}

export default Object.freeze({
  token,
  request,
});
