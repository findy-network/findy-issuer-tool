import { agencyv1, statusParser } from '@findy-network/findy-common-ts';

import log from '../log';

export default async (agentClient, protocolClient, storage, ftnService) => {
  const handlePairwise = async (didExchangeStatus) => {
    if (await ftnService.handleNewConnection(didExchangeStatus.getId())) {
      return;
    }
    log.debug(`Saving connection with id ${didExchangeStatus.getId()}`);
    await storage.saveConnection(
      didExchangeStatus.getId(),
      didExchangeStatus.toObject(),
    );
  };

  const handleProofPaused = async (info, presentProofStatus) => {
    log.info(`Proof request verification request with id ${info.protocolId}`);

    const request = await storage.getProofRequest(info.protocolId);
    const attributes = presentProofStatus.getProof().getAttributesList();
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
        presentProofStatus.toObject(),
      )}, valid: ${!invalid}`,
    );
    const valid = !invalid;

    await storage.addProofRequest(
      info.protocolId,
      request.credDefId,
      request.values,
      true,
      !valid,
    );

    const protocolID = new agencyv1.ProtocolID();
    protocolID.setId(info.protocolId);
    protocolID.setTypeid(agencyv1.Protocol.Type.PRESENT_PROOF);
    protocolID.setRole(agencyv1.Protocol.Role.RESUMER);
    const msg = new agencyv1.ProtocolState();
    msg.setProtocolid(protocolID);
    msg.setState(
      valid
        ? agencyv1.ProtocolState.State.ACK
        : agencyv1.ProtocolState.State.NACK,
    );
    await protocolClient.resume(msg);
  };

  const handleCredentialDone = async (info) => {
    if (await ftnService.handleCredential(info.connectionId, info.success)) {
      return;
    }
    log.debug(`Credential ready for connection ${info.getConnectionid()}`);
  };

  const saveEvent = async (status) => {
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

    await storage.saveEvent(Date.now(), {
      type: typeName,
      protocol: protocolName,
      id: notification.getProtocolid(),
      status: statusName,
    });
  }

  const getValueName = (obj, code) =>
    Object.keys(obj).find((item) => obj[item] === code);

  // infinite listener
  await agentClient.startListening(
    async (status) => {
      saveEvent(status)
      statusParser({
        DIDExchangeDone: (info, didExchange) => handlePairwise(didExchange),
        PresentProofPaused: handleProofPaused,
        IssueCredentialDone: (info) => handleCredentialDone(info),
      }, status);
    },
    {
      protocolClient,
      retryOnError: true,
      autoRelease: true,
      autoProtocolStatus: true,
      filterKeepalive: true,
    },
  );
};
