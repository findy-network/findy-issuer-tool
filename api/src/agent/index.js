import config from 'config';
import {
  createAcator,
  openGRPCConnection,
  agencyv1,
} from '@findy-network/findy-common-ts';
import { v4 as uuidv4 } from 'uuid';

import log from '../log';

export default async (storage) => {
  const acatorProps = {
    authUrl: config.agency.authUrl,
    userName: config.agency.userName,
    key: config.agency.key,
  };

  const authenticator = createAcator(acatorProps);

  const grpcProps = {
    serverAddress: config.agency.serverAddress,
    serverPort: config.agency.serverPort,
    certPath: config.agency.certPath,
    verifyServerIdentity: config.agency.verifyServerIdentity,
  };

  const connection = await openGRPCConnection(grpcProps, authenticator);
  const { createAgentClient, createProtocolClient } = connection;
  const agentClient = await createAgentClient();
  const protocolClient = await createProtocolClient();

  const getValueName = (obj, code) =>
    Object.keys(obj).find((item) => obj[item] === code);

  // infinite listener
  await agentClient.startListening(
    async (status) => {
      const notification = status.agent.getNotification();
      const protocolStatus = status.protocol;
      const state = protocolStatus.getState().getState();

      const typeName = getValueName(
        agencyv1.Notification.Type,
        notification.getTypeid(),
      );
      const protocolName = getValueName(
        agencyv1.Protocol.Type,
        notification.getProtocolType(),
      );
      const statusName = getValueName(agencyv1.ProtocolState.State, state);
      log.debug(`Received ${typeName} for ${protocolName} - ${statusName}`);

      await storage.saveEvent(Date.now(), {
        type: typeName,
        protocol: protocolName,
        id: notification.getProtocolid(),
        status: statusName,
      });
      if (
        notification.getTypeid() === agencyv1.Notification.Type.STATUS_UPDATE &&
        notification.getProtocolType() === agencyv1.Protocol.Type.DIDEXCHANGE &&
        state === agencyv1.ProtocolState.State.OK
      ) {
        log.debug(
          `Saving connection with id ${protocolStatus
            .getDidExchange()
            .getId()}`,
        );
        await storage.saveConnection(
          protocolStatus.getDidExchange().getId(),
          protocolStatus.getDidExchange().toObject(),
        );
      }
    },
    {
      protocolClient,
      retryOnError: true,
      autoRelease: true,
      autoProtocolStatus: true,
      filterKeepalive: true,
    },
  );

  await agentClient.startWaiting(async (question) => {
    const notification = question.getStatus().getNotification();
    const event = {
      type: getValueName(agencyv1.Question.Type, question.getTypeid()),
      protocol: getValueName(
        agencyv1.Protocol.Type,
        notification.getProtocolType(),
      ),
      id: notification.getProtocolid(),
    };
    switch (question.getTypeid()) {
      case agencyv1.Question.Type.PROOF_VERIFY_WAITS: {
        log.info(
          `Proof request verification request with id ${notification.getProtocolid()}`,
        );

        const request = await storage.getProofRequest(
          notification.getProtocolid(),
        );
        const attributes = question.getProofVerify().getAttributesList();
        // the proof is invalid if
        // 1) values do not match
        // 2) cred def id do not match or
        // 3) attribute count do not match
        const invalid =
          request.deleted ||
          attributes.find(
            (item) =>
              item.getValue() !== request.values[item.getName()] ||
              item.getCredDefid() !== request.credDefId,
          ) ||
          attributes.length !== Object.keys(request.values).length;

        log.debug(
          `Verify proof request with data ${JSON.stringify(
            question.toObject(),
          )}, valid: ${!invalid}`,
        );
        const valid = !invalid;

        await storage.addProofRequest(
          notification.getProtocolid(),
          request.credDefId,
          request.values,
          true,
          !valid,
        );

        const msg = new agencyv1.Answer();
        msg.setId(notification.getId());
        msg.setClientid(question.getStatus().getClientid());
        msg.setAck(!invalid);
        await agentClient.give(msg);

        break;
      }
      default:
        log.warn(
          `Received unknown message ${JSON.stringify(question.toObject())}`,
        );
        break;
    }

    await storage.saveEvent(Date.now(), event);
  });

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

  const createPairwiseInvitation = async () => {
    const newId = uuidv4();
    log.info(`Creating invitation for ${config.ourName} - ${newId}`);

    const msg = new agencyv1.InvitationBase();
    msg.setLabel(config.ourName);
    msg.setId(newId);

    const res = await agentClient.createInvitation(msg);

    return res.getJson();
  };

  return {
    createSchema,
    createCredDef,
    pairwiseSendMessage,
    pairwiseSendProofRequest,
    pairwiseSendCredential,
    createPairwiseInvitation,
  };
};
