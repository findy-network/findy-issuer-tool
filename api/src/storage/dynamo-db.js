import config from 'config';
import AWS from 'aws-sdk';

import log from '../log';

export default async () => {
  const allLimit = 20;
  const types = {
    CONNECTION: 'connection',
    EVENT: 'event',
  };
  const awsConfig = {
    region: config.storage.region,
    endpoint: config.storage.host,
  };

  log.info(`AWS dynamodb config endpoint ${awsConfig.endpoint}`);

  AWS.config.update(awsConfig);

  const docClient = new AWS.DynamoDB.DocumentClient();

  const tableName = 'findyIssuerData';

  const putData = async (type, id, data) => {
    try {
      await docClient
        .put({
          TableName: tableName,
          Item: {
            ...data,
            id,
            type,
            timestamp: Date.now(),
          },
        })
        .promise();
    } catch (error) {
      log.error('Unable to put item.', error);
    }
  };

  const getData = async (type, id) => {
    try {
      return (
        await docClient
          .get({
            TableName: tableName,
            Key: {
              type,
              id,
            },
          })
          .promise()
      ).Item;
    } catch (error) {
      log.error('Unable to get item.', error);
    }
    return null;
  };

  const getAllData = async (type, limit = 100) => {
    try {
      return (
        await docClient
          .query({
            ExpressionAttributeNames: {
              '#itemType': 'type',
            },
            ExpressionAttributeValues: {
              ':t': type,
            },
            KeyConditionExpression: '#itemType = :t',
            TableName: tableName,
            Limit: limit,
            ScanIndexForward: false,
          })
          .promise()
      ).Items;
    } catch (error) {
      log.error('Unable to get all items.', error);
    }
    return null;
  };

  const putUser = async (id, data) => putData('user', id, data);
  const getUserObject = async (id) => getData('user', id);
  const putCredentialProposalObject = async (id, data) =>
    putData('credential-proposal', id, data);
  const putProofRequestObject = async (id, data) =>
    putData('proof-request', id, data);
  const getProofRequestObject = async (id) => getData('proof-request', id);
  const putSchema = async (id, data) => putData('schema', id, data);
  const getSchema = async (id) => getData('schema', id);
  const getSchemas = async () => getAllData('schema');
  const putEvent = async (id, data) =>
    putData(types.EVENT, id.toString(), data);
  const putConnection = async (id, data) =>
    putData(types.CONNECTION, id.toString(), data);
  const putDefaultCred = async (id, data) => putData('default-cred', id, data);
  const getDefaultCred = async (id) => {
    const item = await getData('default-cred', id);
    return item ? item.values : null;
  };

  // Create table when in dev environment
  if (config.devMode) {
    log.info('Creating dynamodb storage');
    const params = {
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'type', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'type', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'S' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };
    try {
      const dynamodb = new AWS.DynamoDB();
      await dynamodb.createTable(params).promise();
    } catch (error) {
      log.warn('Unable to create table.', error.stack);
    }
  }

  const getUser = async (id) => {
    const user = await getUserObject(id);
    if (user) {
      return user.values;
    }
    return null;
  };

  const addOrUpdateUser = async (user) => {
    const existingUser = await getUser(user.email);
    const existingCreds =
      existingUser && existingUser.creds ? existingUser.creds : [];
    const newCreds = user.creds || [];
    const data = Object.keys(user).reduce(
      (result, item) => ({ ...result, [item]: user[item] || '-' }),
      {},
    );
    const updatedUser = {
      ...(existingUser || {}),
      ...data,
      creds: [
        ...existingCreds,
        ...newCreds.filter((item) => !existingCreds.includes(item)),
      ],
    };

    return putUser(user.email, { values: updatedUser });
  };

  const saveEvent = (id, payload) => putEvent(id, { payload });

  const saveConnection = (id, payload) => putConnection(id, payload);

  const saveSchema = async (schema) => {
    const existingSchema = await getSchema(schema.id);
    if (!existingSchema) {
      return putSchema(schema.id, {
        ...schema,
        schemaId: schema.id,
        credDefs: [],
      });
    }
    return existingSchema;
  };

  const saveCredDef = async (schemaId, id) => {
    const existingSchema = await getSchema(schemaId);
    const schema = {
      ...existingSchema,
      credDefs: [...existingSchema.credDefs, id],
    };
    return putSchema(schemaId, schema);
  };

  const getLedger = async () => {
    const schemas = await getSchemas();
    const ledger = schemas.reduce(
      (result, item) => ({
        schemas: [...result.schemas, item.schemaId],
        credDefs: [...result.credDefs, ...item.credDefs],
      }),
      { schemas: [], credDefs: [] },
    );
    const credDefsWithDefaults = (
      await Promise.all(
        ledger.credDefs.map(async (item) => ({
          id: item,
          values: await getDefaultCred(item),
        })),
      )
    )
      .filter((item) => item.values)
      .reduce((result, item) => ({ ...result, [item.id]: item.values }), {});
    return { ...ledger, credDefsWithDefaults };
  };

  const getAllEvents = async () => getAllData(types.EVENT, allLimit);

  const getAllConnections = async () => getAllData(types.CONNECTION, allLimit);

  const addCredentialProposal = async (id, credDefId, values) => {
    await putCredentialProposalObject(id, { credDefId, values });
    // If we haven't stored default cred values, store it now
    if (!(await getDefaultCred(credDefId))) {
      await putDefaultCred(credDefId, { values });
    }
  };

  const addProofRequest = async (id, credDefId, values, deleted, valid) =>
    putProofRequestObject(id, {
      values,
      credDefId,
      deleted,
      valid,
    });

  const getProofRequest = async (id) => getProofRequestObject(id);

  return {
    addOrUpdateUser,
    getUser,
    saveEvent,
    saveConnection,
    saveSchema,
    saveCredDef,
    addCredentialProposal,
    addProofRequest,
    getProofRequest,
    getLedger,
    getAllEvents,
    getAllConnections,
    getDefaultCred,
  };
};
