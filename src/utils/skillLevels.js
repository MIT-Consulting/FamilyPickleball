export const SKILL_LEVELS = {
  1: {
    text: 'Beginner',
    range: '1.0-2.0',
    color: '#ffd700' // gold
  },
  2: {
    text: 'Novice',
    range: '2.5-3.0',
    color: '#ffa500' // orange
  },
  3: {
    text: 'Intermediate',
    range: '3.5-4.0',
    color: '#ff8c00' // dark orange
  },
  4: {
    text: 'Advanced',
    range: '4.5-5.0',
    color: '#ff6b6b' // coral red
  },
  5: {
    text: 'Expert',
    range: '5.5+',
    color: '#ff1493' // deep pink
  }
};

export const getSkillLevelColor = (level) => {
  return SKILL_LEVELS[level]?.color || '#757575';
};

export const getSkillLevelText = (level) => {
  return SKILL_LEVELS[level]?.text || 'Unknown';
};

export const getSkillLevelFullText = (level) => {
  const skillLevel = SKILL_LEVELS[level];
  return skillLevel ? `${skillLevel.text} (${skillLevel.range})` : 'Unknown';
}; 