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

export default Object.freeze({
  token,
});
