export default (storage) => {
  const { getAllConnections } = storage;
  const getConnections = async (req, res) => {
    res.json(await getAllConnections());
  };
  return { getConnections };
};
