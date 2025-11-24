function calculatePregnancyInfo(conceptionDate) {
  if (!conceptionDate) {
    return {
      pregnancyWeek: 0,
      trimester: 0,
      daysPregnant: 0,
      weeksRemaining: 40,
      dueDate: null,
    };
  }

  const conception = new Date(conceptionDate);
  const now = new Date();

  const msDiff = now - conception;
  const daysPregnant = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  const pregnancyWeek = Math.floor(daysPregnant / 7);
  const weeksRemaining = Math.max(40 - pregnancyWeek, 0);

  // Trimester rule
  let trimester = 1;
  if (pregnancyWeek >= 13 && pregnancyWeek <= 26) trimester = 2;
  if (pregnancyWeek >= 27) trimester = 3;

  // Due date: conception + 266 days (38 weeks)
  const dueDate = new Date(conception);
  dueDate.setDate(dueDate.getDate() + 266);

  return {
    pregnancyWeek,
    trimester,
    daysPregnant,
    weeksRemaining,
    dueDate,
  };
}

module.exports = calculatePregnancyInfo;
