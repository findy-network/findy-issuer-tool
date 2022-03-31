import log from '../log';

export default async (storage, agent, config) => {
  const credDefId = (await storage.getLedger()).credDefs.find(
    (item) => item.toLowerCase().indexOf('ftn') !== -1,
  );
  const start = async () => {
    const invitation = await agent.createPairwiseInvitation('FTN service');
    const id = JSON.parse(invitation.raw)['@id'];
    await storage.addFtnConnection(id, {
      ...invitation,
      status: 'initialized',
    });

    log.info(`Create new invitation for FTN service ${id}`);

    return { ...invitation, id };
  };

  const handleNewConnection = async (id) => {
    log.info(`Check FTN service for new connection ${id}`);

    const connection = await storage.getFtnConnection(id);
    if (connection) {
      await storage.addFtnConnection(id, {
        ...connection,
        status: 'connected',
      });

      await agent.pairwiseSendMessage({
        connectionId: id,
        msg: 'Welcome to FTN service. Please authenticate with your bank credentials first.',
      });

      setTimeout(() =>
        agent.pairwiseSendMessage(
          {
            connectionId: id,
            msg: `Start authentication by opening the following link in your browser: ${config.ourHost}/ftn/auth?id=${id}`,
          },
          200,
        ),
      );
      return true;
    }
    log.info(`Connection ${id} is not initialized with FTN service`);
    return false;
  };

  const status = async (id) => {
    const connection = await storage.getFtnConnection(id);
    if (!connection) {
      return 'not found';
    }
    log.info(`FTN service connection ${id} status ${connection.status}`);
    return connection.status;
  };

  const authReady = async ({ email: id, creds: [{ values }] }) => {
    const connection = await storage.getFtnConnection(id);
    if (connection) {
      log.info(`Connection ${id} FTN authentication ready`);
      await storage.addFtnConnection(id, {
        ...connection,
        status: 'issue',
        values,
      });
      await agent.pairwiseSendMessage({
        connectionId: id,
        msg: 'Authentication was successful. Please accept the credential to save it to your wallet.',
      });
      await agent.pairwiseSendCredential({
        connectionId: id,
        credDefId,
        values,
      });

      return;
    }
    log.error(`Connection ${id} not found for FTN authentication`);
  };

  const handleCredential = async (id, ok) => {
    const connection = await storage.getFtnConnection(id);
    if (connection) {
      log.info(`Connection ${id} FTN credential ready`);
      await storage.addFtnConnection(id, {
        ...connection,
        status: 'ready',
        result: ok,
      });
      const msg = ok
        ? 'Credential sent successfully.'
        : 'Credential sending failed.';
      await agent.pairwiseSendMessage({
        connectionId: id,
        msg,
      });

      return true;
    }
    log.error(`Connection ${id} not found for FTN credential`);
    return false;
  };
  return {
    start,
    handleNewConnection,
    status,
    authReady,
    handleCredential,
  };
};
