import { Stack } from 'aws-cdk-lib';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { AccountRootPrincipal, Role, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { stageName } from './environment';

export interface RestApis {
  subscriptionApi: RestApi;
  webHookApi: RestApi;
  checkStoreDomainApi: RestApi;
  storeLimitsApi: RestApi;
  apiRestPolicy: PolicyStatement;
}

export function createRestApis(stack: Stack, backend: any): RestApis {
  const apiPolicyStatement = new PolicyStatement({
    actions: ['execute-api:Invoke'],
    resources: ['*'],
    effect: require('aws-cdk-lib').Effect.ALLOW,
  });

  const subscriptionApi = new RestApi(stack, 'SubscriptionApi', {
    restApiName: 'subscription-api',
    deployOptions: { stageName },
  });
  subscriptionApi.root
    .addResource('subscribe')
    .addMethod('POST', new LambdaIntegration(backend.createSubscription.resources.lambda));
  subscriptionApi.root
    .addResource('create-subscription')
    .addMethod('POST', new LambdaIntegration(backend.createSubscription.resources.lambda));

  const webHookApi = new RestApi(stack, 'WebHookApi', {
    restApiName: 'webhook-api',
    deployOptions: { stageName },
  });
  webHookApi.root
    .addResource('polar')
    .addResource('webhook')
    .addMethod('POST', new LambdaIntegration(backend.webHookPlan.resources.lambda));

  const checkStoreDomainApi = new RestApi(stack, 'CheckStoreDomainApi', {
    restApiName: 'check-store-domain-api',
    deployOptions: { stageName },
  });
  checkStoreDomainApi.root
    .addResource('check-domain')
    .addMethod('POST', new LambdaIntegration(backend.checkStoreDomain.resources.lambda));

  const storeLimitsApi = new RestApi(stack, 'StoreLimitsApi', {
    restApiName: 'store-limits-api',
    deployOptions: { stageName },
  });
  storeLimitsApi.root
    .addResource('check-limits')
    .addMethod('POST', new LambdaIntegration(backend.validateStoreLimits.resources.lambda));
  storeLimitsApi.root
    .addResource('check-product-limit')
    .addMethod('POST', new LambdaIntegration(backend.validateStoreLimits.resources.lambda));

  return {
    subscriptionApi,
    webHookApi,
    checkStoreDomainApi,
    storeLimitsApi,
    apiRestPolicy: apiPolicyStatement,
  };
}
