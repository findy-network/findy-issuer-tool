import { agencyv1 } from '@findy-network/findy-common-ts';

import log from '../log';

export default async (agentClient, protocolClient, storage, ftnService) => {
  const handlePairwise = async (status) => {
    const notification = status.agent.getNotification();
    const protocolStatus = status.protocol;
    const state = protocolStatus.getState().getState();
    if (
      notification.getTypeid() !== agencyv1.Notification.Type.STATUS_UPDATE ||
      state !== agencyv1.ProtocolState.State.OK ||
      (await ftnService.handleNewConnection(
        protocolStatus.getDidExchange().getId(),
      ))
    ) {
      return;
    }
    log.debug(
      `Saving connection with id ${protocolStatus.getDidExchange().getId()}`,
    );
    await storage.saveConnection(
      protocolStatus.getDidExchange().getId(),
      protocolStatus.getDidExchange().toObject(),
    );
  };

  const handleProof = async (status) => {
    const notification = status.agent.getNotification();
    const protocolStatus = status.protocol;

    if (
      notification.getTypeid() !== agencyv1.Notification.Type.PROTOCOL_PAUSED
    ) {
      return;
    }
    if (
      notification.getProtocolType() === agencyv1.Protocol.Type.PRESENT_PROOF
    ) {
      log.info(
        `Proof request verification request with id ${notification.getProtocolid()}`,
      );

      const request = await storage.getProofRequest(
        notification.getProtocolid(),
      );
      const attributes = protocolStatus
        .getPresentProof()
        .getProof()
        .getAttributesList();
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
          protocolStatus.getPresentProof().toObject(),
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

      const protocolID = new agencyv1.ProtocolID();
      protocolID.setId(notification.getProtocolid());
      protocolID.setTypeid(notification.getProtocolType());
      protocolID.setRole(agencyv1.Protocol.Role.RESUMER);
      const msg = new agencyv1.ProtocolState();
      msg.setProtocolid(protocolID);
      msg.setState(
        valid
          ? agencyv1.ProtocolState.State.ACK
          : agencyv1.ProtocolState.State.NACK,
      );
      await protocolClient.resume(msg);
    }
  };

  const handleCredential = async (status) => {
    const notification = status.agent.getNotification();
    const protocolStatus = status.protocol;
    const state = protocolStatus.getState().getState();
    if (notification.getTypeid() !== agencyv1.Notification.Type.STATUS_UPDATE) {
      return;
    }
    if (
      await ftnService.handleCredential(
        notification.getConnectionid(),
        state === agencyv1.ProtocolState.State.OK,
      )
    ) {
      return;
    }
    log.debug(
      `Credential ready for connection ${notification.getConnectionid()}`,
    );
  };

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
      switch (notification.getProtocolType()) {
        case agencyv1.Protocol.Type.DIDEXCHANGE:
          await handlePairwise(status);
          break;
        case agencyv1.Protocol.Type.PRESENT_PROOF:
          await handleProof(status);
          break;
        case agencyv1.Protocol.Type.ISSUE_CREDENTIAL:
          await handleCredential(status);
          break;
        default:
          break;
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
};
