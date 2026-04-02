export const TITLE_CATALOG = {
  newbie: { id: 'newbie', name: '校园新生', emoji: '🎒', description: '刚开始校园生活', color: '#95a5a6' },
  killer: { id: 'killer', name: '问题学生', emoji: '😤', description: '累计击杀100人', color: '#e74c3c', requiresAchievement: 'killer10' },
  slayer: { id: 'slayer', name: '校园传说', emoji: '💀', description: '累计击杀1000人', color: '#c0392b', requiresAchievement: 'killer100' },
  reaper: { id: 'reaper', name: '死神', emoji: '🔱', description: '累计击杀10000人', color: '#8e44ad', requiresAchievement: 'killer10000' },
  survivor: { id: 'survivor', name: '生存专家', emoji: '🏕️', description: '单局存活5分钟', color: '#27ae60', requiresAchievement: 'survivor' },
  survivorKing: { id: 'survivorKing', name: '生存王者', emoji: '👑', description: '单局存活10分钟', color: '#16a085', requiresAchievement: 'survivor10' },
  rookie: { id: 'rookie', name: '一年级', emoji: '📖', description: '单局达到10级', color: '#3498db', requiresAchievement: 'level10' },
  senior: { id: 'senior', name: '毕业生', emoji: '🎓', description: '单局达到20级', color: '#2980b9', requiresAchievement: 'level20' },
  master: { id: 'master', name: '教授', emoji: '👨‍🏫', description: '单局达到50级', color: '#8e44ad', requiresAchievement: 'level50' },
  comboMaster: { id: 'comboMaster', name: '连击大师', emoji: '⚡', description: '达成50连击', color: '#f39c12', requiresAchievement: 'combo50' },
  comboGod: { id: 'comboGod', name: '连击之神', emoji: '🔥', description: '达成100连击', color: '#e67e22', requiresAchievement: 'combo100' },
  bossSlayer: { id: 'bossSlayer', name: 'Boss克星', emoji: '🥊', description: '击败第一个Boss', color: '#e74c3c', requiresAchievement: 'bossSlayer' },
  bossEnder: { id: 'bossEnder', name: 'Boss终结者', emoji: '🏆', description: '击败所有Boss', color: '#c0392b', requiresAchievement: 'bossSlayerAll' },
  waveMaster: { id: 'waveMaster', name: '波次大师', emoji: '🌊', description: '存活超过10波', color: '#1abc9c', requiresAchievement: 'waveMaster' },
  waveLegend: { id: 'waveLegend', name: '波次传奇', emoji: '🌀', description: '存活超过20波', color: '#16a085', requiresAchievement: 'wave20' },
  eliteHunter: { id: 'eliteHunter', name: '精英猎手', emoji: '🎯', description: '击败50个精英怪', color: '#9b59b6', requiresAchievement: 'eliteHunter' },
  eliteSlayer: { id: 'eliteSlayer', name: '精英克星', emoji: '👑', description: '击败100个精英怪', color: '#8e44ad', requiresAchievement: 'eliteHunter100' },
  veteran: { id: 'veteran', name: '老兵', emoji: '🎖️', description: '累计游戏10次', color: '#34495e', requiresAchievement: 'veteran' },
  legend: { id: 'legend', name: '传说老兵', emoji: '🏅', description: '累计游戏50次', color: '#2c3e50', requiresAchievement: 'veteran50' },
  collector: { id: 'collector', name: '收藏家', emoji: '📦', description: '解锁所有武器', color: '#e67e22', requiresAchievement: 'collector' },
  noDamage: { id: 'noDamage', name: '完美主义者', emoji: '💎', description: '单局不受伤存活3分钟', color: '#00d2d3', requiresAchievement: 'noDamage' },
  rich: { id: 'rich', name: '富豪', emoji: '💰', description: '单局获得10000分', color: '#f1c40f', requiresAchievement: 'rich' }
};

export function getTitleById(id) {
  return TITLE_CATALOG[id] || null;
}
