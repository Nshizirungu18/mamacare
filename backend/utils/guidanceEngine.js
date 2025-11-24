// backend/utils/guidanceEngine.js
const guidanceMap = {
    nausea: {
      exercise: ["Gentle walking", "Deep breathing"],
      nutrition: ["Ginger tea", "Small frequent meals"],
      dos: ["Stay hydrated", "Eat bland foods"],
      donts: ["Avoid spicy foods", "Skip meals"],
    },
    fatigue: {
      exercise: ["Prenatal yoga", "Stretching"],
      nutrition: ["Iron-rich foods", "Whole grains"],
      dos: ["Rest often", "Eat balanced meals"],
      donts: ["Overexert", "Skip breakfast"],
    },
    // Add more symptoms...
  };
  
  const getGuidanceForSymptoms = (symptoms) => {
    const combined = { exercise: [], nutrition: [], dos: [], donts: [] };
    symptoms.forEach(symptom => {
      const tips = guidanceMap[symptom];
      if (tips) {
        Object.keys(tips).forEach(key => {
          combined[key].push(...tips[key]);
        });
      }
    });
    return combined;
  };
  
  module.exports = { getGuidanceForSymptoms };
  