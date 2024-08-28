import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({
  region: 'us-east-1',
});
const secretCache = {};
const cacheTTL = 5000; // in ms equals 5 seconds. This is very short, just for testing purposes

export async function getCachedSecret(secretArn) {

  const now = new Date().getTime();

  if (secretCache[secretArn] && now - secretCache[secretArn].timestamp < cacheTTL) {
    secretCache[secretArn].source = 'cache';
    return secretCache;
  }

  try {
    const command = new GetSecretValueCommand({ SecretId: secretArn });
    const secret = await client.send(command);
    const parsedSecret = JSON.parse(secret.SecretString);

    secretCache[secretArn] = parsedSecret;
    secretCache[secretArn].timestamp = now;
    secretCache[secretArn].source = 'secrets-manager';

    return secretCache;
  } catch (error) {
    throw new Error(`Failed to retrieve secret: ${error.message}`);
  }
}

