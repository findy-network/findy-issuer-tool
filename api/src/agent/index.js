import {
  createAcator,
  openGRPCConnection,
  agencyv1,
} from '@findy-network/findy-common-ts';

import log from '../log';
import listen from './listen';

export default async (storage, config) => {
  const acatorProps = {
    authUrl: config.agency.authUrl,
    authOrigin: config.agency.authOrigin,
    userName: config.agency.userName,
    seed: config.agency.userSeed,
    key: config.agency.key,
  };

  const authenticator = createAcator(acatorProps);

  const { serverAddress, serverPort, certPath, verifyServerIdentity } =
    config.agency;
  log.info(
    `Connecting to agency address ${serverAddress}, port ${serverPort}, cert ${certPath}, verifyServer ${verifyServerIdentity}`,
  );
  const grpcProps = {
    serverAddress,
    serverPort,
    certPath,
    verifyServerIdentity,
  };

  // Authenticate and open GRPC connection to agency
  const connection = await openGRPCConnection(grpcProps, authenticator);
  const { createAgentClient, createProtocolClient } = connection;
  const agentClient = await createAgentClient();
  const protocolClient = await createProtocolClient();

  const createSchema = async (body) => {
    log.info(`Creating schema ${JSON.stringify(body)}`);

    const msg = new agencyv1.SchemaCreate();
    msg.setName(body.name);
    msg.setVersion(body.version);
    body.attrs.map((item) => msg.addAttributes(item));

    const res = await agentClient.createSchema(msg);

    const schemaId = res.getId();
    log.info(`Schema created with id ${schemaId}`);

    await storage.saveSchema({ ...body, id: schemaId });
    return schemaId;
  };

  const getSchema = async (id) => {
    log.info(`Getting schema ${JSON.stringify(id)}`);

    const msg = new agencyv1.Schema();
    msg.setId(id);

    const res = await agentClient.getSchema(msg);

    return res;
  };

  const createCredDef = async (body) => {
    log.info(`Creating cred def ${JSON.stringify(body)}`);

    const msg = new agencyv1.CredDefCreate();
    msg.setSchemaid(body.schemaId);
    msg.setTag(body.tag);

    const res = await agentClient.createCredDef(msg);

    const credDefId = res.getId();
    log.info(`Cred def created with id ${credDefId}`);

    await storage.saveCredDef(body.schemaId, credDefId);
    return credDefId;
  };

  const pairwiseSendMessage = async (body) => {
    log.info(`Sending message ${body.msg} to ${body.connectionId}`);

    const content = new agencyv1.Protocol.BasicMessageMsg();
    content.setContent(body.msg);

    await protocolClient.sendBasicMessage(body.connectionId, content);

    return true;
  };

  const pairwiseSendProofRequest = async (body) => {
    log.info(`Sending proof request to ${JSON.stringify(body.connectionId)}`);

    const attributes = new agencyv1.Protocol.Proof();
    Object.keys(body.attributes).map((item) => {
      const attr = new agencyv1.Protocol.Proof.Attribute();
      attr.setName(item);
      attr.setCredDefid(body.credDefId);
      attributes.addAttributes(attr);
      return attr;
    });

    const proofRequest = new agencyv1.Protocol.PresentProofMsg();
    proofRequest.setAttributes(attributes);

    const res = await protocolClient.sendProofRequest(
      body.connectionId,
      proofRequest,
    );

    await storage.addProofRequest(
      res.getId(),
      body.credDefId,
      body.attributes,
      false,
      false,
    );

    return true;
  };

  const pairwiseSendCredential = async (body) => {
    log.info(`Sending credential to ${body.connectionId}`);

    const attributes = new agencyv1.Protocol.IssuingAttributes();
    Object.keys(body.values).map((item) => {
      const attr = new agencyv1.Protocol.IssuingAttributes.Attribute();
      attr.setName(item);
      attr.setValue(body.values[item]);
      attributes.addAttributes(attr);
      return attr;
    });

    const credential = new agencyv1.Protocol.IssueCredentialMsg();
    credential.setCredDefid(body.credDefId);
    credential.setAttributes(attributes);

    const res = await protocolClient.sendCredentialOffer(
      body.connectionId,
      credential,
    );

    await storage.addCredentialProposal(
      res.getId(),
      body.credDefId,
      body.values,
    );

    return true;
  };

  const createPairwiseInvitation = async (label = config.ourName) => {
    log.info(`Creating invitation for ${label}`);

    const msg = new agencyv1.InvitationBase();
    msg.setLabel(label);

    const res = await agentClient.createInvitation(msg);

    return {
      url: res.getUrl(),
      raw: res.getJson(),
    };
  };

  const startListening = async (ftnService) => {
    // start listening for status events
    return listen(agentClient, protocolClient, storage, ftnService);
  };

  return {
    createSchema,
    getSchema,
    createCredDef,
    pairwiseSendMessage,
    pairwiseSendProofRequest,
    pairwiseSendCredential,
    createPairwiseInvitation,
    startListening,
  };
};
