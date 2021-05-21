import config from 'config';
import AWS from 'aws-sdk';

import dynamodb from './dynamo-db';

describe('Storage', () => {
  const awsConfig = {
    region: config.storage.region,
    endpoint: config.storage.host,
  };

  AWS.config.update(awsConfig);
  const awsDb = new AWS.DynamoDB();

  afterEach(() => {
    const params = {
      TableName: 'issuerToolData',
    };
    return awsDb.deleteTable(params).promise();
  });
  it('should create dynamodb', async () => {
    expect(await dynamodb(config)).toBeDefined();
  });
  it('should add user', async () => {
    const db = await dynamodb(config);
    const user = { email: 'test', name: 'test-name' };
    await db.addOrUpdateUser(user);
    const result = await db.getUser('test');
    expect(result.email).toEqual(user.email);
    expect(result.name).toEqual(user.name);
  });
  it('should add schema', async () => {
    const db = await dynamodb(config);
    const schema = { id: 'id' };
    await db.saveSchema(schema);
    const result = await db.getLedger();
    expect(result.schemas[0]).toEqual('id');
    expect(result.credDefs).toEqual([]);
  });
  it('should add credDef', async () => {
    const db = await dynamodb(config);
    const schema = { id: 'id' };
    const credDef = 'cred-def-id';
    await db.saveSchema(schema);
    await db.saveCredDef(schema.id, credDef);
    const result = await db.getLedger();
    expect(result.schemas[0]).toEqual(schema.id);
    expect(result.credDefs).toEqual([credDef]);
  });
  it('should fetch events', async () => {
    const db = await dynamodb(config);
    await db.saveEvent('event-id', { description: 'event-description' });
    await db.saveEvent('event-id2', { description: 'event-description2' });
    const result = await db.getAllEvents();
    expect(result.length).toEqual(2);
    expect(result[1].id).toEqual('event-id');
    expect(result[0].id).toEqual('event-id2');
  });
});
