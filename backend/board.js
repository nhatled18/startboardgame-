const types = [
  "special", "normal", "chance", "normal", "normal", "special", "normal", "bomb",
  "normal", "chance", "dead", "normal", "action", "normal", "dead", "normal",
  "special", "normal", "chance", "normal", "special", "normal", "special", "action",
  "bomb", "normal", "special", "dead", "normal", "chance", "special", "normal",
  "action", "chance", "normal", "special", "dead", "normal", "bomb", "normal", "finish",
];
const icons = [
  "🏁", "", "❔", "", "", "🚂", "", "💣", "", "✨", "⛓", "", "", "", "☠",
  "", "🚂", "", "❔", "", "🅿", "", "⚡", "", "💣", "", "🚂", "💸", "", "✨",
  "👀", "", "", "❔", "", "🚂", "💸", "", "💣", "", "🏆",
];
const descriptions = {
  normal: "Cộng 5 điểm",
  special: "Cộng 15 điểm",
  chance: "Rút thẻ cơ hội",
  bomb: "Lùi 2 ô",
  dead: "Lùi 3 ô",
  action: "Bốc hành động",
  finish: "Cộng 30 điểm",
};
const names = {
  normal: "Ô thường",
  special: "Ô đặc biệt",
  chance: "Ô cơ hội",
  bomb: "Ô Bomb",
  dead: "Ô chết chùm",
  action: "Ô hành động",
  finish: "Ô về đích",
};

const cells = types.map((type, index) => ({
  name:
    index === 0 ? "Ô bắt đầu" : index === types.length - 1 ? "Ô về đích" : names[type],
  type,
  icon: icons[index],
  desc: descriptions[type],
  finish: index === types.length - 1,
}));

module.exports = { cells };
