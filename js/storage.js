const MONEY_KEY = "swarm-money";
const HIGH_SCORE_KEY = "swarm-high-score";

export function loadMoney() {
  const raw = localStorage.getItem(MONEY_KEY);
  const value = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function saveMoney(amount) {
  localStorage.setItem(MONEY_KEY, String(Math.max(0, amount)));
}

export function loadHighScore() {
  const raw = localStorage.getItem(HIGH_SCORE_KEY);
  const value = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function saveHighScore(points) {
  const current = loadHighScore();
  if (points > current) {
    localStorage.setItem(HIGH_SCORE_KEY, String(points));
    return points;
  }
  return current;
}
