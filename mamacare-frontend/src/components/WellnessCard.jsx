const WellnessCard = ({ log }) => {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-800">
          {formatDate(log.date)}
        </h3>
        {log.mood && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
            {log.mood}
          </span>
        )}
      </div>

      {log.symptoms && log.symptoms.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Symptoms:</p>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(log.symptoms) ? (
              log.symptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded"
                >
                  {symptom}
                </span>
              ))
            ) : (
              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                {log.symptoms}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        {log.sleepHours !== undefined && log.sleepHours !== null && (
          <div>
            <p className="text-xs text-gray-500">Sleep</p>
            <p className="font-medium text-gray-700">{log.sleepHours} hrs</p>
          </div>
        )}
        {log.hydrationLiters !== undefined && log.hydrationLiters !== null && (
          <div>
            <p className="text-xs text-gray-500">Hydration</p>
            <p className="font-medium text-gray-700">{log.hydrationLiters} L</p>
          </div>
        )}
      </div>

      {log.nutritionNotes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Nutrition Notes:</p>
          <p className="text-sm text-gray-700">{log.nutritionNotes}</p>
        </div>
      )}
    </div>
  );
};

export default WellnessCard;
