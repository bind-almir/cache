# README

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## How it Works

This is a common pattern that exploits Lambda container reuse to cache secrets. The secret is fetched from the AWS Secrets Manager service and cached in the Lambda container for future use. The cached secret is stored in a global variable and is reused for subsequent invocations of the Lambda function. Variables that are stored outside of the handler function are preserved between invocations when the same container is reused.

There is no guarantee that the same container will be reused for subsequent invocations, niether there is a minimum fixed TTL defined. If there is a such internal feature, it is not documented. However, there is a good chance that the same container will be reused if the Lambda function is invoked within a short period of time.

## Helpers module

The `src/helper.mjs` file contains utility functions that can be shared accross the project. 

- getCachedSecret retrieves a secret from the AWS Secrets Manager service and caches it for future use. If the cached secret is older than the specified TTL, a new secret is fetched from the service.

## Index module

The `index.mjs` file serves as the entry point for the Lambda function. It contains the handler function that is invoked by the Lambda service. It is using helper functions from the `src/helper.mjs` file to retrieve the secret from the AWS Secrets Manager service or from the cache.

## Test with Tape

The `test/cache.test.js` file contains unit tests for the getCachedSecret function. The tests are written using the Tape testing framework.

To run the tests, use the following command:

```bash
npm test
```

The test results will be displayed in the console.

## Deployment

The project is using Serverless Framework for deployment. The `serverless.yml` file contains the configuration for the Lambda function and the necessary permissions to access the AWS Secrets Manager service. This project is using httpApi as the event source for the Lambda function.

To deploy the project, use the following command:

```bash
serverless deploy
```
