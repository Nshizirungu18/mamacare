const WellnessCard = ({ log }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-semibold text-lg">{log.title}</h3>
      <p className="text-gray-600">{log.description}</p>
      <p className="text-sm text-gray-400 mt-2">
        Date: {new Date(log.date).toLocaleDateString()}
      </p>
    </div>
  );
};

export default WellnessCard;
