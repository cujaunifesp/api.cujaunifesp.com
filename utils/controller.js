import { NextResponse } from "next/server";

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "utils/errors";

const response = {
  error,
  ok,
};

function error(errorObject) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof InternalServerError ||
    error instanceof UnauthorizedError
  ) {
    return NextResponse.json(
      {
        error: errorObject.getPublicErrorObject(),
      },
      {
        status: errorObject.statusCode,
      },
    );
  }

  const unknownError = new InternalServerError({
    internalErrorMessage: errorObject.message,
    context: {
      originalError: errorObject,
    },
  });

  return NextResponse.json(
    {
      error: unknownError.getPublicErrorObject(),
    },
    {
      status: unknownError.statusCode,
    },
  );
}

function ok(statusCode, data) {
  return NextResponse.json(data, {
    status: statusCode || 200,
  });
}

export default Object.freeze({
  response,
});
