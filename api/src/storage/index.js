import dynamodb from './dynamo-db';

export default async () => {
  const storageInterface = await dynamodb();
  return {
    ...storageInterface,
  };
};
