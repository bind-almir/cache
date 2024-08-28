import { getCachedSecret } from "./helpers.mjs";

export const lambda = async () => {
  const secret = await getCachedSecret(process.env.SECRET_ARN);
  return {
    statusCode: 200,
    body: JSON.stringify(secret),
  };
}