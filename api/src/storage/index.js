import dynamodb from './dynamo-db';

export default async (config) => {
  const storageInterface = await dynamodb(config);
  return {
    ...storageInterface,
  };
};
