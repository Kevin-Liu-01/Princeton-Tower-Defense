import type { Position, Tower } from "../../types";

// Architectural additions share the tower's world transform and cache lifetime.
// No particles, timers, gradients or offscreen canvases are allocated here.
export function drawCapstoneModel(
  ctx: CanvasRenderingContext2D,
  position: Position,
  tower: Tower,
  zoom: number,
  time: number
): void {
  if (!tower.capstone || !tower.upgrade) {
    return;
  }
  const a = tower.upgrade === "A";
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  const gold = "#efbc62";
  const light = a ? gold : "#92e7ef";
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.scale(zoom, zoom);
  ctx.lineJoin = "round";
  const line = (points: number[][], color: string, width = 2) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (const [i, point] of points.entries()) {
      if (i === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    }
    ctx.stroke();
  };
  const polygon = (points: number[][], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const [i, point] of points.entries()) {
      if (i === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#18222d";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  const orb = (x: number, y: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const spire = (x: number, y: number, h: number, color = light) => {
    polygon(
      [
        [x - 9, y],
        [x - 7, y - h],
        [x, y - h - 14],
        [x + 8, y - h],
        [x + 10, y],
      ],
      "#35444f"
    );
    polygon(
      [
        [x, y - h - 14],
        [x + 8, y - h],
        [x, y],
      ],
      color
    );
  };
  const banner = (x: number, y: number, color: string) => {
    line(
      [
        [x, y + 35],
        [x, y - 10],
      ],
      gold,
      2
    );
    const flutter = Math.sin(time * 4 + x) * 4;
    polygon(
      [
        [x, y - 8],
        [x + 24, y - 5 + flutter],
        [x + 19, y + 4 + flutter],
        [x + 24, y + 14 + flutter],
        [x, y + 10],
      ],
      color
    );
    line(
      [
        [x + 7, y - 2],
        [x + 7, y + 5],
      ],
      gold,
      3
    );
  };
  switch (tower.type) {
    case "library": {
      if (a) {
        // Guardian gate: paired stone sentinels and a floating rune seal.
        for (const x of [-43, 43]) {
          polygon(
            [
              [x - 12, -15],
              [x - 10, -89],
              [x + 10, -89],
              [x + 14, -15],
            ],
            "#7a7e70"
          );
          polygon(
            [
              [x - 14, -87],
              [x - 12, -109],
              [x + 10, -112],
              [x + 14, -87],
            ],
            "#a4a38a"
          );
          line(
            [
              [x - 6, -100],
              [x + 6, -100],
            ],
            gold,
            3
          );
          line(
            [
              [x, -80],
              [x - 6, -66],
              [x + 5, -53],
              [x, -38],
            ],
            "#76a37e",
            3
          );
        }
        const y = -166 + Math.sin(time * 2) * 3;
        spire(0, y + 10, 12, gold);
        ctx.globalAlpha = pulse;
        line(
          [
            [-17, y],
            [0, y - 22],
            [17, y],
            [0, y + 22],
            [-17, y],
          ],
          gold
        );
      } else {
        // Glacial crown with orbiting ice shards.
        for (let i = -2; i <= 2; i++) {
          spire(
            i * 18,
            -127 + Math.abs(i) * 12,
            28 - Math.abs(i) * 5,
            "#b9f7ff"
          );
        }
        for (let i = 0; i < 6; i++) {
          const t = time * 0.6 + (i * Math.PI) / 3;
          const x = Math.cos(t) * 48;
          const y = -120 + Math.sin(t) * 16;
          polygon(
            [
              [x, y - 5],
              [x + 3, y],
              [x, y + 5],
              [x - 3, y],
            ],
            "#dcfbff"
          );
        }
      }
      break;
    }
    case "arch": {
      ctx.translate(0, 30);
      if (a) {
        // Open bell cage; bell and clapper swing independently.
        line(
          [
            [-27, -136],
            [-27, -178],
            [27, -178],
            [27, -136],
          ],
          "#7e7568",
          7
        );
        polygon(
          [
            [-35, -180],
            [0, -198],
            [35, -180],
          ],
          gold
        );
        ctx.save();
        ctx.translate(0, -176);
        ctx.rotate(Math.sin(time * 2.6) * 0.16);
        polygon(
          [
            [-8, 3],
            [8, 3],
            [13, 24],
            [18, 29],
            [-18, 29],
            [-13, 24],
          ],
          "#e6a94e"
        );
        orb(Math.sin(time * 2.6 + 0.5) * 5, 30, 4, "#fff1a6");
        ctx.restore();
      } else {
        // Concert organ and orbiting musical keys.
        for (let i = -2; i <= 2; i++) {
          const top = -173 + Math.abs(i) * 12;
          line(
            [
              [i * 12, -124],
              [i * 12, top],
            ],
            gold,
            7
          );
          orb(i * 12, top, 4, "#fff0b5");
        }
        for (let i = 0; i < 3; i++) {
          const t = time + i * 2.1;
          const x = Math.cos(t) * 44;
          const y = -145 + Math.sin(t) * 12;
          orb(x, y, 4, "#ffb56c");
          line(
            [
              [x + 3, y],
              [x + 3, y - 13],
              [x + 9, y - 10],
            ],
            "#ffb56c"
          );
        }
      }
      break;
    }
    case "cannon": {
      if (a) {
        // Rotary magazine, rotating chamber lights and salute pennants.
        banner(-47, -91, "#c75427");
        banner(34, -91, "#c75427");
        orb(0, -101, 22, "#313d43");
        for (let i = 0; i < 6; i++) {
          const t = time * 2 + (i * Math.PI) / 3;
          orb(Math.cos(t) * 14, -101 + Math.sin(t) * 14, 4, gold);
        }
        orb(0, -101, 7, "#111b23");
      } else {
        // Dragon mantle: swept wings, horns and a breathing ember heart.
        polygon(
          [
            [-12, -80],
            [-59, -119],
            [-46, -64],
            [-31, -83],
            [-20, -50],
          ],
          "#8b382d"
        );
        polygon(
          [
            [12, -80],
            [59, -119],
            [46, -64],
            [31, -83],
            [20, -50],
          ],
          "#8b382d"
        );
        spire(-13, -91, 29, gold);
        spire(13, -91, 29, gold);
        orb(0, -99, 10 + pulse * 3, "#ef702d");
        orb(0, -100, 6, "#ffe5a0");
      }
      break;
    }
    case "lab": {
      if (a) {
        // Three-axis plasma containment rings.
        orb(0, -169, 10 + pulse * 2, "#e8beff");
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = ["#cda4ff", "#f2c76b", "#89e5ff"][i];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(
            0,
            -169,
            30,
            10,
            time * 0.4 + (i * Math.PI) / 3,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      } else {
        // A network of four conducting obelisks with travelling arcs.
        for (const x of [-46, -23, 23, 46]) {
          const y = -112 - (46 - Math.abs(x)) * 1.6;
          spire(x, -60, -y - 60, "#63cedb");
          orb(x, y - 12, 5, "#e6ffff");
          const bend = Math.sin(time * 12 + x) * 7;
          line(
            [
              [x, y - 12],
              [x / 2 + bend, -154],
              [0, -166],
            ],
            "#9df4ff",
            1.5
          );
        }
      }
      break;
    }
    case "club": {
      if (a) {
        ctx.translate(0, 18);
        // Treasury dome and a revolving gold astrolabe.
        polygon(
          [
            [-29, -132],
            [-22, -160],
            [0, -178],
            [22, -160],
            [29, -132],
          ],
          "#bd934a"
        );
        line(
          [
            [-24, -139],
            [24, -139],
          ],
          "#ffe0a0",
          3
        );
        ctx.strokeStyle = gold;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(
          0,
          -182,
          19,
          6 + Math.abs(Math.sin(time)) * 8,
          time * 0.3,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        orb(0, -182, 4, "#fff3bf");
      } else {
        // Legion command house, crossed pikes and streaming standards.
        line(
          [
            [-32, -112],
            [25, -180],
          ],
          gold,
          3
        );
        line(
          [
            [32, -112],
            [-25, -180],
          ],
          gold,
          3
        );
        banner(-47, -118, "#a33b36");
        banner(27, -118, "#a33b36");
        polygon(
          [
            [-18, -153],
            [18, -153],
            [15, -132],
            [0, -118],
            [-15, -132],
          ],
          "#813e3a"
        );
        line(
          [
            [0, -147],
            [0, -128],
          ],
          gold,
          4
        );
      }
      break;
    }
    case "mortar": {
      if (a) {
        // Four independent vertical rocket pods.
        for (let i = 0; i < 4; i++) {
          const x = (i - 1.5) * 20;
          const recoil = Math.max(0, Math.sin(time * 3 - i * 1.6)) * 4;
          polygon(
            [
              [x - 7, -48],
              [x - 7, -105 + recoil],
              [x, -121 + recoil],
              [x + 7, -105 + recoil],
              [x + 7, -48],
            ],
            "#6d7779"
          );
          line(
            [
              [x - 5, -91 + recoil],
              [x + 5, -91 + recoil],
            ],
            gold,
            4
          );
        }
      } else {
        ctx.translate(0, 10);
        // Crown brazier, rising flame tongues and glowing slag vents.
        for (const x of [-30, -15, 0, 15, 30]) {
          const h = 19 + (Math.sin(time * 5 + x) + 1) * 9;
          polygon(
            [
              [x - 8, -84],
              [x - 4, -98],
              [x + 3, -84 - h],
              [x + 8, -92],
              [x + 7, -80],
            ],
            "#fa7e32"
          );
        }
        polygon(
          [
            [-40, -86],
            [-28, -58],
            [28, -58],
            [40, -86],
          ],
          "#69463b"
        );
        line(
          [
            [-31, -78],
            [31, -78],
          ],
          "#ffb650",
          3
        );
      }
      break;
    }
    case "station": {
      if (a) {
        ctx.translate(0, 18);
        // Parade pavilion and a visibly ticking station clock.
        banner(-54, -103, "#d06827");
        banner(33, -103, "#d06827");
        polygon(
          [
            [-29, -119],
            [0, -149],
            [29, -119],
          ],
          "#aa633e"
        );
        orb(0, -123, 14, gold);
        orb(0, -123, 11, "#24383e");
        line(
          [
            [0, -131],
            [0, -123],
            [Math.sin(time) * 8, -123 - Math.cos(time) * 8],
          ],
          "#fff0bc"
        );
      } else {
        // Fortified lancer gate, crenellations and cavalry standards.
        for (const x of [-46, 46]) {
          polygon(
            [
              [x - 13, -16],
              [x - 13, -111],
              [x + 13, -111],
              [x + 13, -16],
            ],
            "#637784"
          );
          for (const offset of [-9, 0, 9]) {
            ctx.fillRect(x + offset - 3, -120, 6, 14);
          }
          banner(x - 3, -139, "#326e86");
        }
        line(
          [
            [-22, -95],
            [19, -141],
          ],
          gold,
          3
        );
        line(
          [
            [22, -95],
            [-19, -141],
          ],
          gold,
          3
        );
      }
      break;
    }
  }
  ctx.restore();
}
