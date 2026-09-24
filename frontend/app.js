const colors = ["#ed5b4f", "#2f80ed", "#24a878"];
const API_URL = "https://startboardgame.onrender.com";
const api = (url, options) =>
  fetch(API_URL + url, options).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw Error(data.error);
    return data;
  });
const position = (i) =>
  i < 11
    ? [1, i + 1]
    : i < 20
      ? [i - 9, 11]
      : i < 31
        ? [11, 31 - i]
        : [41 - i, 1];
function draw(state) {
  document.querySelector("#turn").textContent = state.done
    ? `Thắng: ${state.winner.name}`
    : state.teams[state.current].name + " đi";
  document.querySelector("#status").textContent = state.done
    ? "Bấm Ván mới để chơi lại"
    : `Lượt ${state.turn}/9 - còn ${state.teams[state.current].left} lần đi`;
  document.querySelector("#dice").disabled = state.done;
  document.querySelector("#teams").innerHTML = state.teams
    .map(
      (team, i) =>
        `<div class="team ${i === state.current && !state.done ? "active" : ""}" style="border-color:${colors[i]}"><b>${team.name}</b><br><strong>${team.score} điểm</strong><br>1 quân cờ - còn ${team.left} lần đi - ô ${team.position + 1}</div>`,
    )
    .join("");
  document.querySelector("#scoreboard").innerHTML = [...state.teams]
    .sort((first, second) => second.score - first.score)
    .map(
      (team) =>
        `<tr><td>${team.name}</td><td><strong>${team.score}</strong></td><td>${team.left}</td></tr>`,
    )
    .join("");
  document.querySelector("#log").innerHTML = state.log
    .map((item) => `<li>${item}</li>`)
    .join("");
  document.querySelectorAll(".token").forEach((token) => token.remove());
  state.teams.forEach((team, i) => {
    const cell = document.querySelector(`[data-position="${team.position}"]`);
    if (cell)
      cell.insertAdjacentHTML(
        "beforeend",
        `<span class="token" style="color:${colors[i]}">●</span>`,
      );
  });
}
function renderCells(cells) {
  cells.forEach((cell, index) => {
    const element = document.createElement("div");
    element.className = `cell ${cell.type} ${[0, 10, 20, 30].includes(index) ? "corner" : ""}`;
    element.dataset.position = index;
    const [row, column] = position(index);
    element.style.gridRow = row;
    element.style.gridColumn = column;
    element.innerHTML = `<span class="cell-icon">${cell.icon || ""}</span><b>${cell.name}</b><small>${cell.desc}</small>`;
    document.querySelector("#board").append(element);
  });
}
async function refresh() {
  try {
    draw(await api("/api/state"));
  } catch (error) {
    document.querySelector("#error").textContent =
      "Hãy chạy backend bằng: node backend/server.js";
  }
}
document.querySelector("#dice").onclick = async () => {
  try {
    draw(await api("/api/roll", { method: "POST" }));
  } catch (error) {
    document.querySelector("#error").textContent = error.message;
  }
};
document.querySelector("#reset").onclick = async () =>
  draw(await api("/api/reset", { method: "POST" }));
api("/api/cells").then(renderCells).then(refresh).catch(refresh);
