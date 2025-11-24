const ReminderCard = ({ reminder }) => {
  const date = new Date(reminder.dateTime).toLocaleString();

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <h3 className="font-semibold text-lg">{reminder.title}</h3>
      {reminder.description && (
        <p className="text-gray-600 mt-1">{reminder.description}</p>
      )}
      <p className="text-gray-500 mt-2 text-sm">{date}</p>
      <p className="text-gray-400 mt-1 text-xs capitalize">
        {reminder.reminderType}
      </p>
    </div>
  );
};

export default ReminderCard;
