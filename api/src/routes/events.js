export default (storage) => {
  const { getAllEvents } = storage;
  const getEventLog = async (req, res) => {
    res.json(await getAllEvents());
  };
  return { getEventLog };
};
