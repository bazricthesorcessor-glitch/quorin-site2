export const XP_MAX_ORDER_VALUE = 100000;
export const XP_LEVEL_COUNT = 10;

export interface XpLevelData {
  level: number;
  increment: number;
  cumulative: number;
}

export const xpLevelLadder: XpLevelData[] = (() => {
  const thresholds = [0, 2000, 5000, 9000, 15000, 24000, 36000, 52000, 72000, XP_MAX_ORDER_VALUE];

  return thresholds.map((cumulative, index) => ({
    level: index + 1,
    cumulative,
    increment: index === 0 ? cumulative : cumulative - thresholds[index - 1],
  }));
})();

export const getXpLevel = (totalSpend: number) => {
  if (totalSpend <= 0) return 1;
  const reached = xpLevelLadder.reduce((level, item) => (totalSpend >= item.cumulative ? item.level : level), 1);
  return Math.min(reached, XP_LEVEL_COUNT);
};

export const getXpDiscountPercent = (level: number) => {
  const normalizedLevel = Math.min(Math.max(level, 1), XP_LEVEL_COUNT);
  return ((normalizedLevel - 1) / (XP_LEVEL_COUNT - 1)) * 5;
};
