export function middleware(request) {
  if (request.method === "OPTIONS") {
    return response.status(200).send("ok");
  }

  return response;
}
