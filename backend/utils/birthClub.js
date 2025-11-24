// backend/utils/birthClub.js
const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  
  const getBirthClub = (dueDate) => {
    if (!dueDate) return undefined;
    const d = new Date(dueDate);
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };
  
  module.exports = { getBirthClub };
  