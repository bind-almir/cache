import tape from 'tape';
import { getCachedSecret } from '../src/helpers.mjs';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const mockSend = (client, secretValue) => {
  client.send = async (command) => {
    if (command instanceof GetSecretValueCommand) {
      return { SecretString: JSON.stringify(secretValue) };
    }
    throw new Error('Unexpected command');
  };
};

SecretsManagerClient.prototype.send = async function (command) {
  if (command instanceof GetSecretValueCommand) {
    return { SecretString: JSON.stringify({ key: 'value' }) };
  }
  throw new Error('Unexpected command');
};

const secretArn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:test';

const client = new SecretsManagerClient({
  region: 'us-east-1',
});

tape('getCachedSecret - should fetch secret from AWS Secrets Manager', async (t) => {

  const secretValue = { key: 'value' };
  mockSend(client, secretValue);

  const secret = await getCachedSecret(secretArn);

  t.equal(secret[secretArn].key, 'value', 'Fetched secret key should match');
  t.equal(secret[secretArn].source, 'secrets-manager', 'Secret should be fetched from Secrets Manager');
  t.end();
});

tape('getCachedSecret - should return cached secret', async (t) => {

  const secretValue = { key: 'value' };
  mockSend(client, secretValue);

  await getCachedSecret(secretArn); // I need a call to init the cache

  const cachedSecret = await getCachedSecret(secretArn);

  t.equal(cachedSecret[secretArn].key, 'value', 'Cached secret key should match');
  t.equal(cachedSecret[secretArn].source, 'cache', 'Secret should be fetched from cache');
  t.end();
});

tape('getCachedSecret - should fetch new secret after cache expires', async (t) => {

  const secretValue = { key: 'value' };
  mockSend(client, secretValue);

  await getCachedSecret(secretArn); // I need a call to init the cache

  await new Promise((resolve) => setTimeout(resolve, 5001)); //expire cache after 5 seconds but I need to wait 1 ms more

  const newSecretValue = { key: 'new-value' };
  mockSend(client, newSecretValue);

  const newSecret = await getCachedSecret(secretArn);

  t.equal(newSecret[secretArn].source, 'secrets-manager', 'Secret should be fetched from Secrets Manager after cache expiry');
  t.end();
});
