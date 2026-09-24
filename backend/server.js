const http = require("http");
const { cells } = require("./board");
const actions = [
  { text: "Tiến thêm 2 ô", move: 2 },
  { text: "Lùi lại 1 ô", move: -1 },
  { text: "May mắn: tiến thêm 1 ô", move: 1 },
];
let game;
function reset() {
  game = {
    teams: ["Đỏ", "Xanh", "Vàng"].map((color) => ({
      name: "Đội " + color,
      position: 0,
      left: 3,
      score: 0,
      finished: false,
    })),
    current: 0,
    turn: 1,
    done: false,
    winner: null,
    log: ["Ván mới bắt đầu. Đội Đỏ đi trước!"],
  };
  return game;
}
function roll() {
  if (game.done) throw Error("Ván đã kết thúc");
  const team = game.teams[game.current],
    dice = Math.floor(Math.random() * 6) + 1;
  team.position = (team.position + dice) % cells.length;
  team.left--;
  const cell = cells[team.position];
  game.log.unshift(`${team.name} gieo ${dice}, đến ${cell.name}.`);

  if (cell.type === "normal") {
    team.score += 5;
    game.log.unshift(`${team.name} nhận +5 điểm ô thường.`);
  }
  if (cell.type === "special") {
    team.score += 15;
    game.log.unshift(`${team.name} nhận +15 điểm ô đặc biệt.`);
  }
  if (cell.type === "bomb") {
    team.score -= 10;
    team.position = (team.position + cells.length - 2) % cells.length;
    game.log.unshift(`${team.name} dính Bomb: -10 điểm và lùi 2 ô!`);
  }
  if (cell.type === "dead") {
    team.position = (team.position + cells.length - 3) % cells.length;
    const opponents = game.teams.filter((other) => other !== team);
    opponents.forEach((opponent) => {
      opponent.position = Math.max(0, opponent.position - 3);
    });
    game.log.unshift(
      `${team.name} gặp ô Chết chùm: lùi 3 ô, hai đội khác cũng lùi 3 ô!`,
    );
  }
  if (cell.type === "action") {
    const action = actions[Math.floor(Math.random() * actions.length)];
    team.position = (team.position + action.move + cells.length) % cells.length;
    game.log.unshift(`${team.name} bốc hành động: ${action.text}.`);
  }
  if (cell.finish && !team.finished) {
    team.finished = true;
    team.score += 30;
    game.log.unshift(`${team.name} về đích và nhận thưởng +30 điểm!`);
  }
  game.teams.forEach((opponent) => {
    if (opponent !== team && opponent.position === team.position) {
      opponent.position = 0;
      game.log.unshift(`${team.name} đá đít ${opponent.name} về vạch xuất phát!`);
    }
  });
  if (game.teams.every((t) => !t.left)) {
    game.done = true;
    game.winner = game.teams.reduce((leadingTeam, currentTeam) =>
      currentTeam.score > leadingTeam.score ? currentTeam : leadingTeam,
    );
    game.log.unshift("Hết 9 lượt!");
    game.log.unshift(
      `${game.winner.name} thắng với ${game.winner.score} điểm!`,
    );
  } else {
    do game.current = (game.current + 1) % 3;
    while (!game.teams[game.current].left);
    game.turn++;
  }
  return game;
}
reset();
function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}
http
  .createServer((req, res) => {
    if (req.url === "/api/state") return send(res, 200, game);
    if (req.url === "/api/cells") return send(res, 200, cells);
    if (req.method === "POST" && req.url === "/api/reset")
      return send(res, 200, reset());
    if (req.method === "POST" && req.url === "/api/roll")
      try {
        return send(res, 200, roll());
      } catch (error) {
        return send(res, 400, { error: error.message });
      }
    send(res, 404, {
      error: "Backend chỉ cung cấp API. Mở frontend bằng Live Server.",
    });
  })
  .listen(3000, () => console.log("Backend API: http://localhost:3000"));
