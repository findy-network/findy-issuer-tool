import { stringType, stringArrayType } from './common';
import log from '../log';

export default (agent) => {
  const createSchemaBody = {
    type: 'object',
    required: ['name', 'version', 'attrs'],
    properties: {
      name: stringType,
      version: stringType,
      attrs: stringArrayType,
    },
  };

  const createSchema = async (req, res) => {
    try {
      res.json({ id: await agent.createSchema(req.body) });
    } catch (err) {
      const msg = `${req.body.name} Schema creation failed. Perhaps the schema version already exists?`;
      log.error(`${msg} ${err}`);
      res.status(500).json({
        err,
        payload: req.body,
        msg,
        code: 500,
      });
    }
  };

  const createCredDefBody = {
    type: 'object',
    required: ['schemaId', 'tag'],
    properties: {
      schemaId: stringType,
      tag: stringType,
    },
  };

  const createCredDef = async (req, res) => {
    try {
      res.json({ id: await agent.createCredDef(req.body) });
    } catch (err) {
      const msg = `${req.body.tag} Cred def creation failed. Perhaps the cred def already exists?`;
      log.error(`${msg} ${err}`);
      res.status(500).json({
        err,
        payload: req.body,
        msg,
        code: 500,
      });
    }
  };

  return {
    createSchemaRoute: (validate) => [
      validate({ body: createSchemaBody }),
      createSchema,
    ],
    createCredDefRoute: (validate) => [
      validate({ body: createCredDefBody }),
      createCredDef,
    ],
  };
};
