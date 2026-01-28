
// Special Building Types rendering
export function renderSpecialBuilding(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    zoom: number,
    specType: string,
    specHp: number | undefined,
    specialTowerHp: number | null,
    vaultFlash: number
  ): void {
    const s = zoom;
    const time = Date.now() / 1000;
  
    ctx.save();
    ctx.translate(screenX, screenY);
  
    switch (specType) {
      case "beacon": {
        const s2 = s * 1.1;
        const pulse = Math.sin(time * 3) * 0.5 + 0.5;
  
        // Isometric Constants
        const w = 22 * s2;
        const h = 55 * s2;
        const tanA = Math.tan(Math.PI / 6);
  
        // 1. Ground Shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 0, 32 * s2, 16 * s2, 0, 0, Math.PI * 2);
        ctx.fill();
  
        // 2. Lighter Tiered Granite Pedestal
        const drawHex = (
          hw: number,
          hh: number,
          y: number,
          c1: string,
          c2: string,
          c3: string
        ) => {
          ctx.save();
          ctx.translate(0, y + 4 * s2);
          ctx.fillStyle = c1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-hw, -hw * tanA);
          ctx.lineTo(-hw, -hw * tanA - hh);
          ctx.lineTo(0, -hh);
          ctx.fill();
          ctx.fillStyle = c2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(hw, -hw * tanA);
          ctx.lineTo(hw, -hw * tanA - hh);
          ctx.lineTo(0, -hh);
          ctx.fill();
          ctx.fillStyle = c3;
          ctx.beginPath();
          ctx.moveTo(0, -hh);
          ctx.lineTo(-hw, -hw * tanA - hh);
          ctx.lineTo(0, -hw * tanA * 2 - hh);
          ctx.lineTo(hw, -hw * tanA - hh);
          ctx.fill();
          ctx.restore();
        };
  
        drawHex(w, 8 * s2, 8 * s2, "#78909C", "#90A4AE", "#B0BEC5");
        drawHex(w * 0.7, 6 * s2, -4 * s2, "#546E7A", "#78909C", "#CFD8DC");
  
        // 3. The Spire
        const spireW = 11 * s2;
        const spireH = 55 * s2;
        const topY = -9 * s2;
  
        ctx.fillStyle = "#546E7A";
        ctx.beginPath();
        ctx.moveTo(0, topY);
        ctx.lineTo(-spireW, topY - spireW * tanA);
        ctx.lineTo(-spireW * 0.6, topY - spireW * tanA - spireH);
        ctx.lineTo(0, topY - spireH);
        ctx.fill();
  
        ctx.fillStyle = "#78909C";
        ctx.beginPath();
        ctx.moveTo(0, topY);
        ctx.lineTo(spireW, topY - spireW * tanA);
        ctx.lineTo(spireW * 0.6, topY - spireW * tanA - spireH);
        ctx.lineTo(0, topY - spireH);
        ctx.fill();
  
        // 4. ADVANCED VARIED RUNES
        ctx.save();
        ctx.shadowBlur = 12 * s2;
        ctx.shadowColor = "#00E5FF";
        ctx.strokeStyle = `rgba(128, 255, 255, ${0.4 + pulse * 0.6})`;
        ctx.lineWidth = 1.8 * s2;
        ctx.lineCap = "round";
  
        for (let f = 0; f < 2; f++) {
          const side = f === 0 ? -1 : 1;
          const scroll = (time * 12) % 40;
  
          for (let r = 0; r < 4; r++) {
            const rY = topY - 10 * s2 - r * 15 * s2 + scroll;
            if (rY > topY || rY < topY - spireH + 5 * s2) continue;
  
            const xOff = side * (spireW * 0.5);
            const yOff = rY + Math.abs(xOff) * tanA;
  
            ctx.save();
            ctx.translate(xOff, yOff);
  
            ctx.beginPath();
            if (r % 4 === 0) {
              ctx.moveTo(0, -4 * s2);
              ctx.lineTo(2 * s2, -2 * s2);
              ctx.lineTo(0, 0);
              ctx.lineTo(-2 * s2, -2 * s2);
              ctx.closePath();
            } else if (r % 4 === 1) {
              ctx.moveTo(-2 * s2, 0);
              ctx.lineTo(0, -4 * s2);
              ctx.lineTo(2 * s2, 0);
              ctx.moveTo(0, -4 * s2);
              ctx.lineTo(0, -1 * s2);
            } else if (r % 4 === 2) {
              ctx.moveTo(-2 * s2, -2 * s2);
              ctx.lineTo(2 * s2, -2 * s2);
              ctx.moveTo(0, 0);
              ctx.lineTo(0, -1 * s2);
            } else {
              ctx.arc(0, -2 * s2, 2 * s2, 0, Math.PI * 2);
            }
            ctx.stroke();
            ctx.restore();
          }
        }
        ctx.restore();
  
        // 5. Orbital Energy Rings
        for (let r = 0; r < 2; r++) {
          ctx.save();
          const ringY =
            topY - 15 * s2 - r * 22 * s2 + Math.sin(time + r) * 4 * s2;
          ctx.translate(0, ringY);
          ctx.scale(1, 0.5);
          ctx.rotate(time * (r === 0 ? 0.7 : -1.2));
  
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.3 + pulse * 0.3})`;
          ctx.lineWidth = 2.5 * s2;
          ctx.setLineDash([10 * s2, 20 * s2]);
          ctx.beginPath();
          ctx.arc(0, 0, 20 * s2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
  
        // 6. The Core Pulse Sphere
        const coreY = topY - spireH - 12 * s2 + Math.sin(time * 2.5) * 6 * s2;
  
        const coreGlow = ctx.createRadialGradient(
          0,
          coreY,
          0,
          0,
          coreY,
          15 * s2
        );
        coreGlow.addColorStop(0, "#FFFFFF");
        coreGlow.addColorStop(0.2, "#E0F7FA");
        coreGlow.addColorStop(0.5, "#00E5FF");
        coreGlow.addColorStop(1, "transparent");
  
        ctx.save();
        ctx.shadowBlur = 30 * s2;
        ctx.shadowColor = "#00E5FF";
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(0, coreY, 15 * s2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
  
        // 7. Occasional Energy "Leaks"
        if (Math.random() > 0.92) {
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, topY - spireH);
          ctx.lineTo(
            (Math.random() - 0.5) * 20,
            coreY + (Math.random() - 0.5) * 20
          );
          ctx.stroke();
        }
        break;
      }
  
      case "vault": {
        const hpPct =
          specialTowerHp !== null && specHp ? specialTowerHp / specHp : 1;
        const isFlashing = vaultFlash > 0;
        const s2 = s * 1.2;
  
        const w = 26 * s2;
        const h = 36 * s2;
        const angle = Math.PI / 6;
        const tanAngle = Math.tan(angle);
        const roofOffset = w * tanAngle * 2;
  
        // Ground Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(0, -w * tanAngle, 38 * s2, 20 * s2, 0, 0, Math.PI * 2);
        ctx.fill();
  
        // STATE: DESTROYED
        if (
          hpPct <= 0 ||
          specHp === 0 ||
          (specHp !== undefined && specialTowerHp === null)
        ) {
          ctx.fillStyle = "#3D3D3D";
          ctx.beginPath();
          ctx.moveTo(-w - 5 * s2, 0);
          ctx.lineTo(0, 10 * s2);
          ctx.lineTo(w + 8 * s2, 2 * s2);
          ctx.lineTo(0, -10 * s2);
          ctx.fill();
  
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.moveTo(-w * 0.8, -h * 0.2);
          ctx.lineTo(w * 0.9, -h * 0.1);
          ctx.lineTo(w * 0.9, -h - roofOffset * 0.8);
          ctx.lineTo(-w * 0.8, -h - roofOffset * 0.6);
          ctx.fill();
  
          ctx.fillStyle = "#4A4A4A";
          ctx.beginPath();
          ctx.moveTo(0, 5 * s2);
          ctx.lineTo(-w, -w * tanAngle + 2 * s2);
          ctx.lineTo(-w * 0.9, -h * 0.5);
          ctx.lineTo(-w * 1.1, -h - roofOffset * 0.5);
          ctx.lineTo(0, -h - 5 * s2);
          ctx.fill();
  
          ctx.save();
          ctx.translate(w * 0.8, -h * 0.4);
          ctx.rotate(Math.PI / 8);
          ctx.fillStyle = "#5A5A5A";
          ctx.fillRect(-12 * s2, -18 * s2, 24 * s2, 36 * s2);
          ctx.fillStyle = "#2D2D2D";
          ctx.beginPath();
          ctx.arc(0, -5 * s2, 6 * s2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
  
          ctx.fillStyle = "rgba(80, 80, 80, 0.4)";
          for (let i = 0; i < 3; i++) {
            const smokeOffset = (time * 2 + i * 1.5) % 4;
            const smokeX = Math.sin(time + i) * 10 * s2;
            ctx.beginPath();
            ctx.arc(
              smokeX,
              -h - roofOffset - smokeOffset * 15 * s2,
              (5 + smokeOffset * 3) * s2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          break;
        }
  
        // STATE: ACTIVE VAULT
        const c = isFlashing
          ? {
            baseLight: "#E8E8E8",
            baseDark: "#C0C0C0",
            wallLeft: "#D4A5A5",
            wallRight: "#E8BFBF",
            wallTop: "#F0D0D0",
            frame: "#CC8080",
            trim: "#B06060",
            dark: "#6B3030",
            accent: "#FFFFFF",
            glow: "#FF6B6B",
          }
          : {
            baseLight: "#5D5D5D",
            baseDark: "#3D3D3D",
            wallLeft: "#6B5D4D",
            wallRight: "#8B7355",
            wallTop: "#9D8B73",
            frame: "#5C4A3A",
            trim: "#786048",
            dark: "#2D2420",
            accent: "#A08060",
            glow: "#5A9080",
          };
  
        // Stone Foundation Base
        const baseH = 8 * s2;
  
        const baseGradL = ctx.createLinearGradient(-w - 4 * s2, 0, 0, 0);
        baseGradL.addColorStop(0, "#2D2D2D");
        baseGradL.addColorStop(1, "#3D3D3D");
        ctx.fillStyle = baseGradL;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-w - 4 * s2, -w * tanAngle - 2 * s2);
        ctx.lineTo(-w - 4 * s2, -w * tanAngle - 2 * s2 - baseH);
        ctx.lineTo(0, -baseH);
        ctx.fill();
  
        const baseGradR = ctx.createLinearGradient(0, 0, w + 4 * s2, 0);
        baseGradR.addColorStop(0, "#4D4D4D");
        baseGradR.addColorStop(1, "#3D3D3D");
        ctx.fillStyle = baseGradR;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w + 4 * s2, -w * tanAngle - 2 * s2);
        ctx.lineTo(w + 4 * s2, -w * tanAngle - 2 * s2 - baseH);
        ctx.lineTo(0, -baseH);
        ctx.fill();
  
        ctx.fillStyle = "#454545";
        ctx.beginPath();
        ctx.moveTo(0, -baseH);
        ctx.lineTo(-w - 4 * s2, -w * tanAngle - 2 * s2 - baseH);
        ctx.lineTo(0, -w * tanAngle * 2 - 4 * s2 - baseH);
        ctx.lineTo(w + 4 * s2, -w * tanAngle - 2 * s2 - baseH);
        ctx.closePath();
        ctx.fill();
  
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1 * s2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.5 - 2 * s2, -w * tanAngle * 0.5 - 1 * s2 - baseH * 0.5);
        ctx.lineTo(0, -baseH * 0.5);
        ctx.lineTo(w * 0.5 + 2 * s2, -w * tanAngle * 0.5 - 1 * s2 - baseH * 0.5);
        ctx.stroke();
  
        // Main Vault Body
        const bodyY = -baseH;
  
        const wallGradL = ctx.createLinearGradient(-w, bodyY - w * tanAngle, 0, bodyY);
        wallGradL.addColorStop(0, "#5A4A3A");
        wallGradL.addColorStop(0.5, c.wallLeft);
        wallGradL.addColorStop(1, "#7A6A5A");
        ctx.fillStyle = wallGradL;
        ctx.beginPath();
        ctx.moveTo(0, bodyY);
        ctx.lineTo(-w, bodyY - w * tanAngle);
        ctx.lineTo(-w, bodyY - w * tanAngle - h);
        ctx.lineTo(0, bodyY - h);
        ctx.closePath();
        ctx.fill();
  
        const wallGradR = ctx.createLinearGradient(0, bodyY, w, bodyY - w * tanAngle);
        wallGradR.addColorStop(0, "#9A8A75");
        wallGradR.addColorStop(0.5, c.wallRight);
        wallGradR.addColorStop(1, "#7A6A55");
        ctx.fillStyle = wallGradR;
        ctx.beginPath();
        ctx.moveTo(0, bodyY);
        ctx.lineTo(w, bodyY - w * tanAngle);
        ctx.lineTo(w, bodyY - w * tanAngle - h);
        ctx.lineTo(0, bodyY - h);
        ctx.closePath();
        ctx.fill();
  
        const topGrad = ctx.createLinearGradient(0, bodyY - h - roofOffset, 0, bodyY - h);
        topGrad.addColorStop(0, "#A89878");
        topGrad.addColorStop(1, c.wallTop);
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.moveTo(0, bodyY - h);
        ctx.lineTo(-w, bodyY - w * tanAngle - h);
        ctx.lineTo(0, bodyY - roofOffset - h);
        ctx.lineTo(w, bodyY - w * tanAngle - h);
        ctx.closePath();
        ctx.fill();
  
        // Decorative Wall Panels
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.moveTo(-3 * s2, bodyY - h * 0.15);
        ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle + 3 * s2 - h * 0.15);
        ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
        ctx.lineTo(-3 * s2, bodyY - h + 5 * s2);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.beginPath();
        ctx.moveTo(3 * s2, bodyY - h * 0.15);
        ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle + 3 * s2 - h * 0.15);
        ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
        ctx.lineTo(3 * s2, bodyY - h + 5 * s2);
        ctx.closePath();
        ctx.fill();
  
        // Corner Pilasters
        ctx.fillStyle = c.frame;
        ctx.beginPath();
        ctx.moveTo(0, bodyY);
        ctx.lineTo(-4 * s2, bodyY - 2 * s2);
        ctx.lineTo(-4 * s2, bodyY - h + 2 * s2);
        ctx.lineTo(0, bodyY - h);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = c.trim;
        ctx.beginPath();
        ctx.moveTo(w, bodyY - w * tanAngle);
        ctx.lineTo(w - 4 * s2, bodyY - w * tanAngle + 2 * s2);
        ctx.lineTo(w - 4 * s2, bodyY - w * tanAngle - h + 2 * s2);
        ctx.lineTo(w, bodyY - w * tanAngle - h);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = "#4A3A2A";
        ctx.beginPath();
        ctx.moveTo(-w, bodyY - w * tanAngle);
        ctx.lineTo(-w + 4 * s2, bodyY - w * tanAngle + 2 * s2);
        ctx.lineTo(-w + 4 * s2, bodyY - w * tanAngle - h + 2 * s2);
        ctx.lineTo(-w, bodyY - w * tanAngle - h);
        ctx.closePath();
        ctx.fill();
  
        // Cornice/Crown Molding
        const corniceH = 5 * s2;
  
        ctx.fillStyle = c.trim;
        ctx.beginPath();
        ctx.moveTo(0, bodyY - h);
        ctx.lineTo(-w - 2 * s2, bodyY - w * tanAngle - h - 1 * s2);
        ctx.lineTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH);
        ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.moveTo(0, bodyY - h);
        ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - 1 * s2);
        ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH);
        ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
        ctx.closePath();
        ctx.fill();
  
        ctx.strokeStyle = c.dark;
        ctx.lineWidth = 1.5 * s2;
        ctx.beginPath();
        ctx.moveTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH);
        ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
        ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH);
        ctx.stroke();
  
        // Rivets
        const rivetPositions = [
          { x: -w + 3 * s2, yBase: bodyY - w * tanAngle },
          { x: w - 3 * s2, yBase: bodyY - w * tanAngle },
          { x: -2 * s2, yBase: bodyY },
          { x: 2 * s2, yBase: bodyY },
        ];
  
        rivetPositions.forEach((pos) => {
          for (let i = 0; i < 4; i++) {
            const ry = pos.yBase - h * 0.2 - (i * h * 0.22);
            ctx.fillStyle = c.frame;
            ctx.beginPath();
            ctx.arc(pos.x, ry, 3 * s2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = c.dark;
            ctx.beginPath();
            ctx.arc(pos.x, ry, 1.5 * s2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            ctx.beginPath();
            ctx.arc(pos.x - 0.5 * s2, ry - 0.5 * s2, 0.8 * s2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
  
        // Central Crest/Emblem
        ctx.save();
        ctx.translate(-w * 0.5, bodyY - w * tanAngle * 0.5 - h * 0.5);
  
        ctx.fillStyle = c.dark;
        ctx.beginPath();
        ctx.moveTo(0, -10 * s2);
        ctx.lineTo(-8 * s2, -6 * s2);
        ctx.lineTo(-8 * s2, 6 * s2);
        ctx.quadraticCurveTo(0, 14 * s2, 8 * s2, 6 * s2);
        ctx.lineTo(8 * s2, -6 * s2);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = c.trim;
        ctx.beginPath();
        ctx.moveTo(0, -7 * s2);
        ctx.lineTo(-5 * s2, -4 * s2);
        ctx.lineTo(-5 * s2, 4 * s2);
        ctx.quadraticCurveTo(0, 10 * s2, 5 * s2, 4 * s2);
        ctx.lineTo(5 * s2, -4 * s2);
        ctx.closePath();
        ctx.fill();
  
        ctx.strokeStyle = c.dark;
        ctx.lineWidth = 2 * s2;
        ctx.beginPath();
        ctx.arc(0, 0, 3 * s2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -5 * s2);
        ctx.lineTo(0, 5 * s2);
        ctx.stroke();
        ctx.restore();
  
        // The Grand Vault Door
        ctx.save();
        const doorCenterX = w * 0.5;
        const doorCenterY = bodyY - h * 0.5 - w * tanAngle * 0.5;
        ctx.translate(doorCenterX, doorCenterY);
  
        ctx.fillStyle = c.frame;
        ctx.strokeStyle = c.dark;
        ctx.lineWidth = 2 * s2;
        ctx.beginPath();
        ctx.moveTo(-10 * s2, -14 * s2);
        ctx.lineTo(14 * s2, -14 * s2 + 14 * tanAngle);
        ctx.lineTo(14 * s2, 16 * s2 + 14 * tanAngle);
        ctx.lineTo(-10 * s2, 16 * s2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
  
        ctx.fillStyle = c.trim;
        ctx.beginPath();
        ctx.moveTo(-7 * s2, -11 * s2);
        ctx.lineTo(11 * s2, -11 * s2 + 11 * tanAngle);
        ctx.lineTo(11 * s2, 13 * s2 + 11 * tanAngle);
        ctx.lineTo(-7 * s2, 13 * s2);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = c.dark;
        ctx.fillRect(-8 * s2, -5 * s2, 20 * s2, 2 * s2);
        ctx.fillRect(-8 * s2, 5 * s2, 20 * s2, 2 * s2);
  
        ctx.fillStyle = "#2D2420";
        ctx.fillRect(-9 * s2, -12 * s2, 3 * s2, 6 * s2);
        ctx.fillRect(-9 * s2, 8 * s2, 3 * s2, 6 * s2);
  
        ctx.fillStyle = c.dark;
        ctx.beginPath();
        ctx.arc(2 * s2, 1 * s2, 11 * s2, 0, Math.PI * 2);
        ctx.fill();
  
        ctx.fillStyle = c.frame;
        ctx.beginPath();
        ctx.arc(2 * s2, 1 * s2, 9 * s2, 0, Math.PI * 2);
        ctx.fill();
  
        ctx.fillStyle = c.dark;
        for (let n = 0; n < 12; n++) {
          const notchAngle = (n * Math.PI * 2) / 12;
          const nx = 2 * s2 + Math.cos(notchAngle) * 8 * s2;
          const ny = 1 * s2 + Math.sin(notchAngle) * 8 * s2;
          ctx.beginPath();
          ctx.arc(nx, ny, 1 * s2, 0, Math.PI * 2);
          ctx.fill();
        }
  
        ctx.fillStyle = c.trim;
        ctx.beginPath();
        ctx.arc(2 * s2, 1 * s2, 6 * s2, 0, Math.PI * 2);
        ctx.fill();
  
        const dialSpeed = time * 1.2;
        ctx.save();
        ctx.translate(2 * s2, 1 * s2);
        ctx.rotate(dialSpeed);
  
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.arc(0, 0, 4.5 * s2, 0, Math.PI * 2);
        ctx.fill();
  
        ctx.strokeStyle = c.dark;
        ctx.lineWidth = 1.5 * s2;
        for (let spoke = 0; spoke < 3; spoke++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const spokeAngle = (spoke * Math.PI * 2) / 3;
          ctx.lineTo(Math.cos(spokeAngle) * 4 * s2, Math.sin(spokeAngle) * 4 * s2);
          ctx.stroke();
        }
  
        ctx.shadowColor = c.glow;
        ctx.shadowBlur = isFlashing ? 25 : 12;
        ctx.fillStyle = isFlashing ? "#FFF" : c.glow;
        ctx.beginPath();
        ctx.arc(0, 0, 2 * s2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 1 * s2);
        ctx.lineTo(-1.5 * s2, 4 * s2);
        ctx.lineTo(1.5 * s2, 4 * s2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
  
        ctx.restore();
        ctx.restore();
  
        // Handle/Lever
        ctx.save();
        ctx.translate(doorCenterX + 12 * s2, doorCenterY + 8 * s2);
        ctx.fillStyle = c.dark;
        ctx.fillRect(-2 * s2, -8 * s2, 4 * s2, 16 * s2);
        ctx.fillStyle = c.frame;
        ctx.beginPath();
        ctx.arc(0, -8 * s2, 3 * s2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 8 * s2, 3 * s2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
  
        // Roof Ornament
        const roofPeakY = bodyY - h - roofOffset;
  
        ctx.fillStyle = c.dark;
        ctx.beginPath();
        ctx.moveTo(-6 * s2, roofPeakY + 3 * s2);
        ctx.lineTo(0, roofPeakY - 2 * s2);
        ctx.lineTo(6 * s2, roofPeakY + 3 * s2);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = c.trim;
        ctx.beginPath();
        ctx.moveTo(-4 * s2, roofPeakY + 2 * s2);
        ctx.lineTo(0, roofPeakY - 1 * s2);
        ctx.lineTo(4 * s2, roofPeakY + 2 * s2);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.arc(0, roofPeakY - 5 * s2, 3 * s2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(-1 * s2, roofPeakY - 6 * s2, 1.2 * s2, 0, Math.PI * 2);
        ctx.fill();
  
        // Ambient Glow
        if (!isFlashing) {
          const ambientGlow = ctx.createRadialGradient(
            doorCenterX,
            doorCenterY,
            0,
            doorCenterX,
            doorCenterY,
            25 * s2
          );
          ambientGlow.addColorStop(0, "rgba(90, 144, 128, 0.15)");
          ambientGlow.addColorStop(1, "transparent");
          ctx.fillStyle = ambientGlow;
          ctx.beginPath();
          ctx.arc(doorCenterX, doorCenterY, 25 * s2, 0, Math.PI * 2);
          ctx.fill();
        }
  
        // Damage Effects
        if (hpPct < 0.75) {
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          ctx.lineWidth = 1 * s2;
          ctx.beginPath();
          ctx.moveTo(-w * 0.7, bodyY - h * 0.3);
          ctx.lineTo(-w * 0.3, bodyY - h * 0.5);
          ctx.moveTo(-w * 0.6, bodyY - h * 0.7);
          ctx.lineTo(-w * 0.2, bodyY - h * 0.6);
          ctx.moveTo(w * 0.3, bodyY - w * tanAngle - h * 0.4);
          ctx.lineTo(w * 0.6, bodyY - w * tanAngle - h * 0.6);
          ctx.stroke();
        }
  
        if (hpPct < 0.4) {
          const flicker = Math.sin(time * 20) > 0;
  
          ctx.strokeStyle = flicker ? "#FFEB3B" : "#FF5722";
          ctx.shadowColor = "#FF5722";
          ctx.shadowBlur = 15 * s2;
          ctx.lineWidth = 2.5 * s2;
          ctx.beginPath();
          ctx.moveTo(-w * 0.2, bodyY);
          ctx.lineTo(-w * 0.5, bodyY - h * 0.3);
          ctx.lineTo(-w * 0.3, bodyY - h * 0.7);
          ctx.lineTo(0, bodyY - h);
          ctx.lineTo(w * 0.2, bodyY - h - roofOffset * 0.5);
          ctx.stroke();
          ctx.shadowBlur = 0;
  
          const beaconY = roofPeakY - 12 * s2;
          ctx.fillStyle = c.dark;
          ctx.fillRect(-3 * s2, beaconY, 6 * s2, 6 * s2);
  
          ctx.save();
          ctx.translate(0, beaconY);
          ctx.fillStyle = flicker ? "#FF0000" : "#B71C1C";
          ctx.shadowColor = "#FF0000";
          ctx.shadowBlur = 25;
          ctx.beginPath();
          ctx.arc(0, 0, 4 * s2, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.rotate(time * 6);
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(5 * s2, -3 * s2);
          ctx.lineTo(5 * s2, 3 * s2);
          ctx.fill();
          ctx.restore();
  
          if (Math.random() > 0.85) {
            ctx.fillStyle = "#FFF";
            ctx.beginPath();
            const sparkX = (Math.random() - 0.5) * w;
            const sparkY = bodyY - h * 0.5 + (Math.random() - 0.5) * h;
            ctx.arc(sparkX, sparkY, 2 * s2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
  
        // Health Bar
        if (specialTowerHp !== null && specHp) {
          const barWidth = 70 * s2;
          const barHeight = 10 * s2;
          const yOffset = roofPeakY - 22 * s2;
  
          ctx.save();
          ctx.translate(0, yOffset);
  
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 3;
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.rect(-barWidth / 2 - 2 * s2, -2 * s2, barWidth + 4 * s2, barHeight + 4 * s2);
          ctx.fill();
  
          ctx.fillStyle = "#2D2D2D";
          ctx.beginPath();
          ctx.rect(-barWidth / 2, 0, barWidth, barHeight);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
  
          const hpColorStr =
            hpPct > 0.6 ? "#4CAF50" : hpPct > 0.3 ? "#FF9800" : "#F44336";
          const grad = ctx.createLinearGradient(
            -barWidth / 2,
            0,
            barWidth / 2,
            0
          );
          grad.addColorStop(0, hpColorStr);
          grad.addColorStop(1, isFlashing ? "#FFF" : hpColorStr);
  
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.rect(
            -barWidth / 2 + 2 * s2,
            2 * s2,
            (barWidth - 4 * s2) * hpPct,
            barHeight - 4 * s2
          );
          ctx.fill();
  
          ctx.fillStyle = "#E0E0E0";
          ctx.font = `800 ${7 * s2}px "bc-novatica-cyr", Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.shadowColor = "black";
          ctx.shadowBlur = 4;
          ctx.fillText("PROTECT THE VAULT", 0, -4 * s2);
          ctx.restore();
        }
        break;
      }
  
      case "shrine": {
        const healCycle = Date.now() % 5000;
        const isHealing = healCycle < 1200;
        const s2 = s * 1.1;
  
        const w = 32 * s2;
        const h = 12 * s2;
        const tanA = Math.tan(Math.PI / 6);
  
        // Foundation Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(0, -w * tanA, 45 * s2, 25 * s2, 0, 0, Math.PI * 2);
        ctx.fill();
  
        const drawOrnateStep = (
          sw: number,
          sh: number,
          gradL: CanvasGradient | string,
          gradR: CanvasGradient | string,
          topColor?: string
        ) => {
          ctx.fillStyle = gradL;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-sw, -sw * tanA);
          ctx.lineTo(-sw, -sw * tanA - sh);
          ctx.lineTo(0, -sh);
          ctx.fill();
          ctx.fillStyle = gradR;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(sw, -sw * tanA);
          ctx.lineTo(sw, -sw * tanA - sh);
          ctx.lineTo(0, -sh);
          ctx.fill();
          if (topColor) {
            ctx.fillStyle = topColor;
            ctx.beginPath();
            ctx.moveTo(0, -sh);
            ctx.lineTo(-sw, -sw * tanA - sh);
            ctx.lineTo(0, -sw * tanA * 2 - sh);
            ctx.lineTo(sw, -sw * tanA - sh);
            ctx.closePath();
            ctx.fill();
          }
        };
  
        // Tiered Base
        ctx.save();
  
        const baseGradL1 = ctx.createLinearGradient(-w, 0, 0, 0);
        baseGradL1.addColorStop(0, "#37474F");
        baseGradL1.addColorStop(1, "#455A64");
        const baseGradR1 = ctx.createLinearGradient(0, 0, w, 0);
        baseGradR1.addColorStop(0, "#607D8B");
        baseGradR1.addColorStop(1, "#546E7A");
        drawOrnateStep(w, h, baseGradL1, baseGradR1, "#4E5D63");
  
        ctx.strokeStyle = "#78909C";
        ctx.lineWidth = 1.5 * s2;
        ctx.beginPath();
        ctx.moveTo(-w, -w * tanA - h);
        ctx.lineTo(0, -h);
        ctx.lineTo(w, -w * tanA - h);
        ctx.stroke();
  
        ctx.translate(0, -h);
        const w2 = w * 0.75;
        const baseGradL2 = ctx.createLinearGradient(-w2, 0, 0, 0);
        baseGradL2.addColorStop(0, "#2E4A52");
        baseGradL2.addColorStop(1, "#3D5C5F");
        const baseGradR2 = ctx.createLinearGradient(0, 0, w2, 0);
        baseGradR2.addColorStop(0, "#4A7C7F");
        baseGradR2.addColorStop(1, "#3D6B6E");
        drawOrnateStep(w2, h * 1.2, baseGradL2, baseGradR2, "#456563");
  
        ctx.strokeStyle = "rgba(118, 255, 3, 0.3)";
        ctx.lineWidth = 1 * s2;
        ctx.beginPath();
        ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
        ctx.lineTo(-w2 * 0.5 - 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
        ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
        ctx.lineTo(-w2 * 0.5 + 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
        ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
        ctx.lineTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
        ctx.lineTo(w2 * 0.5 - 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
        ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
        ctx.lineTo(w2 * 0.5 + 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
        ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
        ctx.lineTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.9);
        ctx.stroke();
  
        ctx.translate(0, -h * 1.2);
        const w3 = w * 0.45;
        const baseGradL3 = ctx.createLinearGradient(-w3, 0, 0, 0);
        baseGradL3.addColorStop(0, "#1B3A3D");
        baseGradL3.addColorStop(1, "#2A4F52");
        const baseGradR3 = ctx.createLinearGradient(0, 0, w3, 0);
        baseGradR3.addColorStop(0, "#3D6B6E");
        baseGradR3.addColorStop(1, "#2E5558");
        drawOrnateStep(w3, h * 0.8, baseGradL3, baseGradR3, "#355855");
  
        ctx.restore();
  
        // Corner Pillars with Crystals
        const pillarPositions = [
          { x: -w * 0.7, y: -w * tanA * 0.7, side: "left" },
          { x: w * 0.7, y: -w * tanA * 0.7, side: "right" },
          { x: -w * 0.35, y: -w * tanA * 0.35 - h, side: "left" },
          { x: w * 0.35, y: -w * tanA * 0.35 - h, side: "right" },
        ];
  
        pillarPositions.forEach((pil, idx) => {
          ctx.save();
          ctx.translate(pil.x, pil.y);
  
          ctx.fillStyle = pil.side === "left" ? "#37474F" : "#546E7A";
          ctx.fillRect(-4 * s2, -2 * s2, 8 * s2, 4 * s2);
  
          const pillarGrad = ctx.createLinearGradient(-3 * s2, 0, 3 * s2, 0);
          if (pil.side === "left") {
            pillarGrad.addColorStop(0, "#2E4A52");
            pillarGrad.addColorStop(0.5, "#3D5C5F");
            pillarGrad.addColorStop(1, "#2E4A52");
          } else {
            pillarGrad.addColorStop(0, "#3D6B6E");
            pillarGrad.addColorStop(0.5, "#4A8285");
            pillarGrad.addColorStop(1, "#3D6B6E");
          }
          ctx.fillStyle = pillarGrad;
          ctx.fillRect(-3 * s2, -2 * s2, 6 * s2, -25 * s2);
  
          ctx.fillStyle = pil.side === "left" ? "#455A64" : "#607D8B";
          ctx.fillRect(-5 * s2, -27 * s2, 10 * s2, 4 * s2);
  
          const crystalGlow = 0.5 + Math.sin(time * 3 + idx) * 0.3;
          ctx.shadowBlur = (isHealing ? 15 : 8) * s2;
          ctx.shadowColor = `rgba(118, 255, 3, ${crystalGlow})`;
  
          ctx.fillStyle = `rgba(144, 238, 144, ${0.7 + crystalGlow * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(0, -40 * s2);
          ctx.lineTo(-4 * s2, -32 * s2);
          ctx.lineTo(-3 * s2, -27 * s2);
          ctx.lineTo(3 * s2, -27 * s2);
          ctx.lineTo(4 * s2, -32 * s2);
          ctx.closePath();
          ctx.fill();
  
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + crystalGlow * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(0, -38 * s2);
          ctx.lineTo(-2 * s2, -33 * s2);
          ctx.lineTo(0, -30 * s2);
          ctx.lineTo(2 * s2, -33 * s2);
          ctx.closePath();
          ctx.fill();
  
          ctx.shadowBlur = 0;
          ctx.restore();
        });
  
        // Sacred Bowl/Brazier
        ctx.save();
        const bowlY = -h * 2.2;
        ctx.translate(0, bowlY);
  
        ctx.fillStyle = "#4E342E";
        ctx.beginPath();
        ctx.ellipse(0, 0, 14 * s2, 7 * s2, 0, 0, Math.PI * 2);
        ctx.fill();
  
        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath();
        ctx.ellipse(0, -2 * s2, 11 * s2, 5 * s2, 0, 0, Math.PI * 2);
        ctx.fill();
  
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 1.5 * s2;
        ctx.beginPath();
        ctx.ellipse(0, 2 * s2, 13 * s2, 6.5 * s2, 0, 0, Math.PI, true);
        ctx.stroke();
  
        ctx.fillStyle = "#3E2723";
        ctx.fillRect(-5 * s2, 4 * s2, 10 * s2, 8 * s2);
        ctx.fillStyle = "#5D4037";
        ctx.fillRect(-4 * s2, 4 * s2, 8 * s2, 8 * s2);
        ctx.restore();
  
        // Floating Runestones
        for (let i = 0; i < 5; i++) {
          ctx.save();
          const orbitAngle = time * 0.6 + (i * Math.PI * 2) / 5;
          const orbitRadius = 28 * s2;
          const bob = Math.sin(time * 2.5 + i * 1.2) * 5 * s2;
          const rx = Math.cos(orbitAngle) * orbitRadius;
          const ry = -45 * s2 + Math.sin(orbitAngle) * 12 * s2 + bob;
  
          ctx.translate(rx, ry);
          ctx.rotate(Math.sin(time + i) * 0.2);
  
          const stoneSize = (6 + Math.sin(i * 2) * 2) * s2;
  
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath();
          ctx.moveTo(2 * s2, -stoneSize + 2 * s2);
          ctx.lineTo(stoneSize + 2 * s2, 2 * s2);
          ctx.lineTo(2 * s2, stoneSize + 2 * s2);
          ctx.lineTo(-stoneSize + 2 * s2, 2 * s2);
          ctx.closePath();
          ctx.fill();
  
          ctx.fillStyle = "#1B3A3D";
          ctx.beginPath();
          ctx.moveTo(0, -stoneSize);
          ctx.lineTo(-stoneSize, 0);
          ctx.lineTo(0, stoneSize);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
  
          ctx.fillStyle = "#2E5558";
          ctx.beginPath();
          ctx.moveTo(0, -stoneSize);
          ctx.lineTo(stoneSize, 0);
          ctx.lineTo(0, stoneSize);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
  
          const runeGlow = isHealing ? 1 : 0.5 + Math.sin(time * 4 + i) * 0.3;
          ctx.shadowBlur = (isHealing ? 12 : 6) * s2;
          ctx.shadowColor = "#76FF03";
          ctx.strokeStyle = `rgba(204, 255, 144, ${runeGlow})`;
          ctx.lineWidth = 1.5 * s2;
  
          ctx.beginPath();
          if (i % 3 === 0) {
            ctx.moveTo(0, -stoneSize * 0.6);
            ctx.lineTo(0, stoneSize * 0.6);
            ctx.moveTo(-stoneSize * 0.3, -stoneSize * 0.2);
            ctx.lineTo(stoneSize * 0.3, stoneSize * 0.2);
          } else if (i % 3 === 1) {
            ctx.moveTo(-stoneSize * 0.4, -stoneSize * 0.4);
            ctx.lineTo(stoneSize * 0.4, stoneSize * 0.4);
            ctx.moveTo(stoneSize * 0.4, -stoneSize * 0.4);
            ctx.lineTo(-stoneSize * 0.4, stoneSize * 0.4);
          } else {
            ctx.moveTo(0, -stoneSize * 0.5);
            ctx.lineTo(-stoneSize * 0.4, stoneSize * 0.3);
            ctx.lineTo(stoneSize * 0.4, stoneSize * 0.3);
            ctx.closePath();
          }
          ctx.stroke();
  
          ctx.shadowBlur = 0;
          ctx.restore();
        }
  
        // Central Sacred Flame
        const flameY = bowlY - 8 * s2;
        const flamePulse = 0.85 + Math.sin(time * 10) * 0.15;
        const flameSize = 22 * s2 * flamePulse;
  
        const auraGrad = ctx.createRadialGradient(
          0,
          flameY,
          0,
          0,
          flameY,
          flameSize * 1.8
        );
        auraGrad.addColorStop(0, "rgba(118, 255, 3, 0.3)");
        auraGrad.addColorStop(0.5, "rgba(118, 255, 3, 0.1)");
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, flameY, flameSize * 1.8, 0, Math.PI * 2);
        ctx.fill();
  
        const fireGrad = ctx.createRadialGradient(
          0,
          flameY,
          0,
          0,
          flameY,
          flameSize
        );
        fireGrad.addColorStop(0, "#FFFFFF");
        fireGrad.addColorStop(0.2, "#E8F5E9");
        fireGrad.addColorStop(0.4, "#CCFF90");
        fireGrad.addColorStop(0.7, "rgba(118, 255, 3, 0.5)");
        fireGrad.addColorStop(1, "transparent");
  
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(0, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
  
        for (let t = 0; t < 4; t++) {
          const tendrilAngle = time * 3 + (t * Math.PI) / 2;
          const tendrilLen = (12 + Math.sin(time * 6 + t) * 4) * s2;
          const tx = Math.cos(tendrilAngle) * 8 * s2;
          const ty = flameY + Math.sin(tendrilAngle) * 4 * s2 - tendrilLen * 0.5;
  
          const tendrilGrad = ctx.createLinearGradient(tx, ty, tx, ty - tendrilLen);
          tendrilGrad.addColorStop(0, "rgba(204, 255, 144, 0.8)");
          tendrilGrad.addColorStop(1, "transparent");
  
          ctx.fillStyle = tendrilGrad;
          ctx.beginPath();
          ctx.moveTo(tx - 3 * s2, ty);
          ctx.quadraticCurveTo(tx + Math.sin(time * 8 + t) * 4 * s2, ty - tendrilLen * 0.5, tx, ty - tendrilLen);
          ctx.quadraticCurveTo(tx - Math.sin(time * 8 + t) * 4 * s2, ty - tendrilLen * 0.5, tx + 3 * s2, ty);
          ctx.fill();
        }
  
        // Ambient Floating Particles
        for (let p = 0; p < 8; p++) {
          const pTime = time + p * 0.8;
          const pLifeCycle = (pTime * 0.5) % 1;
          const pAngle = p * (Math.PI / 4) + time * 0.3;
          const pDist = 15 * s2 + pLifeCycle * 25 * s2;
          const px = Math.cos(pAngle) * pDist;
          const py = flameY - pLifeCycle * 40 * s2 + Math.sin(pTime * 2) * 5 * s2;
          const pAlpha = Math.sin(pLifeCycle * Math.PI) * 0.6;
          const pSize = (1 + Math.sin(pTime * 3) * 0.5) * s2;
  
          ctx.fillStyle = `rgba(204, 255, 144, ${pAlpha})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
  
        // Sacred Circle on Ground
        const circleY = -w * tanA * 2;
        ctx.save();
        ctx.scale(1, 0.5);
        ctx.strokeStyle = "rgba(118, 255, 3, 0.15)";
        ctx.lineWidth = 2 * s2;
        ctx.beginPath();
        ctx.arc(0, circleY, 38 * s2, 0, Math.PI * 2);
        ctx.stroke();
  
        ctx.setLineDash([4 * s2, 4 * s2]);
        ctx.beginPath();
        ctx.arc(0, circleY, 32 * s2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
  
        ctx.fillStyle = "rgba(118, 255, 3, 0.2)";
        for (let d = 0; d < 4; d++) {
          const dAngle = (d * Math.PI) / 2;
          const dx = Math.cos(dAngle) * 35 * s2;
          const dy = circleY + Math.sin(dAngle) * 35 * s2;
          ctx.beginPath();
          ctx.arc(dx, dy, 3 * s2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
  
        // HEALING PULSE EFFECT
        if (isHealing) {
          const prog = healCycle / 1200;
          const ringRad = 200 * prog;
          const pulseY = -w * tanA * 2;
  
          ctx.save();
          ctx.scale(1, 0.5);
  
          for (let ring = 0; ring < 3; ring++) {
            const ringProg = Math.max(0, prog - ring * 0.15);
            if (ringProg > 0) {
              const ringAlpha = (1 - ringProg) * (1 - ring * 0.3);
              ctx.strokeStyle = `rgba(118, 255, 3, ${ringAlpha})`;
              ctx.lineWidth = (4 - ring) * s2;
              ctx.beginPath();
              ctx.arc(0, pulseY, ringRad * s2 * (1 - ring * 0.2), 0, Math.PI * 2);
              ctx.stroke();
            }
          }
  
          ctx.fillStyle = `rgba(204, 255, 144, ${0.9 * (1 - prog)})`;
          for (let sym = 0; sym < 6; sym++) {
            const symAngle = (sym * Math.PI) / 3 + time * 0.5;
            const symDist = 25 + prog * 60;
            const sx = Math.cos(symAngle) * symDist * s2;
            const sy = pulseY - prog * 80 * s2 + Math.sin(symAngle) * symDist * s2 * 0.5;
  
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(symAngle);
  
            ctx.fillRect(-1.5 * s2, -5 * s2, 3 * s2, 10 * s2);
            ctx.fillRect(-5 * s2, -1.5 * s2, 10 * s2, 3 * s2);
            ctx.restore();
          }
          ctx.restore();
  
          const beamAlpha = 0.4 * (1 - prog);
          const beamGrad = ctx.createLinearGradient(0, flameY, 0, -100 * s2);
          beamGrad.addColorStop(0, `rgba(204, 255, 144, ${beamAlpha})`);
          beamGrad.addColorStop(0.5, `rgba(118, 255, 3, ${beamAlpha * 0.5})`);
          beamGrad.addColorStop(1, "transparent");
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(-8 * s2, flameY);
          ctx.lineTo(-4 * s2, -100 * s2);
          ctx.lineTo(4 * s2, -100 * s2);
          ctx.lineTo(8 * s2, flameY);
          ctx.fill();
        }
  
        break;
      }
  
      case "barracks": {
        const spawnCycle = Date.now() % 12000;
        const isSpawning = spawnCycle < 1500;
        const isPreparing = spawnCycle > 10500;
  
        const w = 34 * s;
        const h = 48 * s;
        const angle = Math.PI / 6;
        const tanA = Math.tan(angle);
  
        // Foundation Shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(0, -w * tanA, 44 * s, 22 * s, 0, 0, Math.PI * 2);
        ctx.fill();
  
        // Stone Foundation/Base Platform
        const baseH = 6 * s;
        ctx.fillStyle = "#37474F";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-w - 3 * s, -w * tanA - 2 * s);
        ctx.lineTo(-w - 3 * s, -w * tanA - 2 * s - baseH);
        ctx.lineTo(0, -baseH);
        ctx.fill();
  
        ctx.fillStyle = "#546E7A";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w + 3 * s, -w * tanA - 2 * s);
        ctx.lineTo(w + 3 * s, -w * tanA - 2 * s - baseH);
        ctx.lineTo(0, -baseH);
        ctx.fill();
  
        ctx.fillStyle = "#4E5D63";
        ctx.beginPath();
        ctx.moveTo(0, -baseH);
        ctx.lineTo(-w - 3 * s, -w * tanA - 2 * s - baseH);
        ctx.lineTo(0, -w * tanA * 2 - 4 * s - baseH);
        ctx.lineTo(w + 3 * s, -w * tanA - 2 * s - baseH);
        ctx.closePath();
        ctx.fill();
  
        // Main Building Faces
        const wallGradL = ctx.createLinearGradient(
          -w,
          -w * tanA - baseH,
          0,
          -baseH
        );
        wallGradL.addColorStop(0, "#3D4F59");
        wallGradL.addColorStop(0.5, "#455A64");
        wallGradL.addColorStop(1, "#4A6270");
        ctx.fillStyle = wallGradL;
        ctx.beginPath();
        ctx.moveTo(0, -baseH);
        ctx.lineTo(-w, -w * tanA - baseH);
        ctx.lineTo(-w, -w * tanA - h - baseH);
        ctx.lineTo(0, -h - baseH);
        ctx.fill();
  
        const wallGradR = ctx.createLinearGradient(
          0,
          -baseH,
          w,
          -w * tanA - baseH
        );
        wallGradR.addColorStop(0, "#6B8794");
        wallGradR.addColorStop(0.5, "#607D8B");
        wallGradR.addColorStop(1, "#546E7A");
        ctx.fillStyle = wallGradR;
        ctx.beginPath();
        ctx.moveTo(0, -baseH);
        ctx.lineTo(w, -w * tanA - baseH);
        ctx.lineTo(w, -w * tanA - h - baseH);
        ctx.lineTo(0, -h - baseH);
        ctx.fill();
  
        // Masonry Detail
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1 * s;
        for (let row = 1; row < 5; row++) {
          const yOff = -(h / 5) * row - baseH;
          ctx.beginPath();
          ctx.moveTo(-w, -w * tanA + yOff);
          ctx.lineTo(0, yOff);
          ctx.lineTo(w, -w * tanA + yOff);
          ctx.stroke();
  
          const offset = row % 2 === 0 ? 8 * s : 0;
          for (let col = 1; col < 3; col++) {
            const xLeft = (-w / 3) * col + offset * 0.3;
            const xRight = (w / 3) * col - offset * 0.3;
            ctx.beginPath();
            ctx.moveTo(xLeft, yOff - (h / 5) * 0.5 + Math.abs(xLeft) * tanA);
            ctx.lineTo(xLeft, yOff + Math.abs(xLeft) * tanA);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(xRight, yOff - (h / 5) * 0.5 + Math.abs(xRight) * tanA);
            ctx.lineTo(xRight, yOff + Math.abs(xRight) * tanA);
            ctx.stroke();
          }
        }
  
        // Corner Stone Accents
        ctx.fillStyle = "#37474F";
        for (let i = 0; i < 4; i++) {
          const cornerY = -baseH - 10 * s - i * 12 * s;
          ctx.fillRect(-w - 2 * s, -w * tanA + cornerY - 1 * s, 6 * s, 10 * s);
          ctx.fillRect(w - 4 * s, -w * tanA + cornerY - 1 * s, 6 * s, 10 * s);
        }
  
        // Arrow Slit Windows
        ctx.fillStyle = "#1a1a2e";
        ctx.save();
        ctx.translate(-w * 0.5, -w * tanA * 0.5 - h * 0.65 - baseH);
        ctx.beginPath();
        ctx.moveTo(0, -8 * s);
        ctx.lineTo(-2 * s, -4 * s);
        ctx.lineTo(-2 * s, 6 * s);
        ctx.lineTo(2 * s, 6 * s);
        ctx.lineTo(2 * s, -4 * s);
        ctx.closePath();
        ctx.fill();
        if (isPreparing) {
          ctx.fillStyle = "rgba(79, 195, 247, 0.4)";
          ctx.fill();
        }
        ctx.restore();
  
        ctx.save();
        ctx.translate(w * 0.5, -w * tanA * 0.5 - h * 0.65 - baseH);
        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath();
        ctx.moveTo(0, -8 * s);
        ctx.lineTo(-2 * s, -4 * s);
        ctx.lineTo(-2 * s, 6 * s);
        ctx.lineTo(2 * s, 6 * s);
        ctx.lineTo(2 * s, -4 * s);
        ctx.closePath();
        ctx.fill();
        if (isPreparing) {
          ctx.fillStyle = "rgba(79, 195, 247, 0.4)";
          ctx.fill();
        }
        ctx.restore();
  
        // The Grand Archway Door
        const doorY = -baseH - 8 * s;
        ctx.save();
        if (isPreparing || isSpawning) {
          ctx.shadowBlur = 20 * s;
          ctx.shadowColor = "#4FC3F7";
        }
  
        ctx.fillStyle = "#37474F";
        ctx.beginPath();
        ctx.moveTo(-14 * s, doorY);
        ctx.lineTo(-14 * s, doorY - 28 * s);
        ctx.quadraticCurveTo(0, doorY - 42 * s, 14 * s, doorY - 28 * s);
        ctx.lineTo(14 * s, doorY);
        ctx.lineTo(11 * s, doorY);
        ctx.lineTo(11 * s, doorY - 26 * s);
        ctx.quadraticCurveTo(0, doorY - 38 * s, -11 * s, doorY - 26 * s);
        ctx.lineTo(-11 * s, doorY);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = "#4E342E";
        ctx.beginPath();
        ctx.moveTo(-4 * s, doorY - 34 * s);
        ctx.lineTo(0, doorY - 38 * s);
        ctx.lineTo(4 * s, doorY - 34 * s);
        ctx.lineTo(2 * s, doorY - 30 * s);
        ctx.lineTo(-2 * s, doorY - 30 * s);
        ctx.closePath();
        ctx.fill();
  
        const archGrad = ctx.createLinearGradient(0, doorY - 30 * s, 0, doorY);
        archGrad.addColorStop(0, "#0a0a12");
        archGrad.addColorStop(0.7, isPreparing ? "#0D47A1" : "#1a1a2e");
        archGrad.addColorStop(1, isPreparing ? "#1565C0" : "#263238");
        ctx.fillStyle = archGrad;
  
        ctx.beginPath();
        ctx.moveTo(-10 * s, doorY);
        ctx.lineTo(-10 * s, doorY - 25 * s);
        ctx.quadraticCurveTo(0, doorY - 36 * s, 10 * s, doorY - 25 * s);
        ctx.lineTo(10 * s, doorY);
        ctx.fill();
  
        ctx.strokeStyle = "rgba(78, 52, 46, 0.3)";
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(0, doorY);
        ctx.lineTo(0, doorY - 32 * s);
        ctx.stroke();
        ctx.restore();
  
        // Wall-mounted Torches
        const torchFlicker = Math.sin(time * 8) * 0.15 + 0.85;
        ctx.save();
        ctx.translate(-18 * s, doorY - 20 * s);
        ctx.fillStyle = "#3E2723";
        ctx.fillRect(-1 * s, 0, 3 * s, 8 * s);
        ctx.fillRect(-3 * s, 6 * s, 7 * s, 3 * s);
        ctx.shadowBlur = 12 * s;
        ctx.shadowColor = `rgba(255, 150, 50, ${torchFlicker})`;
        ctx.fillStyle = `rgba(255, 180, 50, ${torchFlicker})`;
        ctx.beginPath();
        ctx.ellipse(0.5 * s, -2 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 220, 100, ${torchFlicker})`;
        ctx.beginPath();
        ctx.ellipse(0.5 * s, -3 * s, 2 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
  
        ctx.save();
        ctx.translate(18 * s, doorY - 20 * s);
        ctx.fillStyle = "#3E2723";
        ctx.fillRect(-1 * s, 0, 3 * s, 8 * s);
        ctx.fillRect(-3 * s, 6 * s, 7 * s, 3 * s);
        ctx.shadowBlur = 12 * s;
        ctx.shadowColor = `rgba(255, 150, 50, ${torchFlicker})`;
        ctx.fillStyle = `rgba(255, 180, 50, ${torchFlicker})`;
        ctx.beginPath();
        ctx.ellipse(0.5 * s, -2 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 220, 100, ${torchFlicker})`;
        ctx.beginPath();
        ctx.ellipse(0.5 * s, -3 * s, 2 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
  
        // The Roof
        const roofH = 30 * s;
        const roofOverhang = 8 * s;
        const roofBase = -h - baseH;
  
        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath();
        ctx.moveTo(-w - roofOverhang, -w * tanA + roofBase + 4 * s);
        ctx.lineTo(0, roofBase + 4 * s);
        ctx.lineTo(w + roofOverhang, -w * tanA + roofBase + 4 * s);
        ctx.lineTo(w + roofOverhang, -w * tanA + roofBase);
        ctx.lineTo(0, roofBase);
        ctx.lineTo(-w - roofOverhang, -w * tanA + roofBase);
        ctx.closePath();
        ctx.fill();
  
        const roofGradL = ctx.createLinearGradient(
          -w - roofOverhang,
          -w * tanA + roofBase,
          0,
          roofBase - roofH
        );
        roofGradL.addColorStop(0, "#1B2631");
        roofGradL.addColorStop(0.4, "#212F3C");
        roofGradL.addColorStop(1, "#283747");
        ctx.fillStyle = roofGradL;
        ctx.beginPath();
        ctx.moveTo(0, roofBase);
        ctx.lineTo(-w - roofOverhang, -w * tanA + roofBase);
        ctx.lineTo(0, roofBase - roofH);
        ctx.fill();
  
        const roofGradR = ctx.createLinearGradient(
          0,
          roofBase - roofH,
          w + roofOverhang,
          -w * tanA + roofBase
        );
        roofGradR.addColorStop(0, "#34495E");
        roofGradR.addColorStop(0.6, "#2C3E50");
        roofGradR.addColorStop(1, "#273746");
        ctx.fillStyle = roofGradR;
        ctx.beginPath();
        ctx.moveTo(0, roofBase);
        ctx.lineTo(w + roofOverhang, -w * tanA + roofBase);
        ctx.lineTo(0, roofBase - roofH);
        ctx.fill();
  
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1 * s;
        for (let i = 1; i < 5; i++) {
          const t = i / 5;
          const startX = -w * t - roofOverhang * t;
          const startY = -w * tanA * t + roofBase;
          const endX = 0;
          const endY = roofBase - roofH * t;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX + (startX - endX) * 0.1, endY + (startY - endY) * 0.1);
          ctx.stroke();
        }
  
        for (let i = 1; i < 5; i++) {
          const t = i / 5;
          const startX = w * t + roofOverhang * t;
          const startY = -w * tanA * t + roofBase;
          const endX = 0;
          const endY = roofBase - roofH * t;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX + (startX - endX) * 0.1, endY + (startY - endY) * 0.1);
          ctx.stroke();
        }
  
        ctx.strokeStyle = "#4E342E";
        ctx.lineWidth = 4 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-w - roofOverhang, -w * tanA + roofBase);
        ctx.lineTo(0, roofBase - roofH);
        ctx.lineTo(w + roofOverhang, -w * tanA + roofBase);
        ctx.stroke();
  
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.moveTo(0, roofBase - roofH - 8 * s);
        ctx.lineTo(-4 * s, roofBase - roofH);
        ctx.lineTo(4 * s, roofBase - roofH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFA000";
        ctx.beginPath();
        ctx.arc(0, roofBase - roofH - 4 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
  
        // Waving Banner
        ctx.save();
        const poleX = -w * 0.7;
        const poleY = -w * tanA - h * 0.9 - baseH;
        ctx.translate(poleX, poleY);
  
        ctx.fillStyle = "#5D4037";
        ctx.fillRect(-2 * s, 0, 4 * s, -50 * s);
        ctx.fillStyle = "#795548";
        ctx.fillRect(-1.5 * s, 0, 3 * s, -50 * s);
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(-2.5 * s, -10 * s, 5 * s, 2 * s);
        ctx.fillRect(-2.5 * s, -25 * s, 5 * s, 2 * s);
        ctx.beginPath();
        ctx.moveTo(0, -50 * s);
        ctx.lineTo(-4 * s, -54 * s);
        ctx.lineTo(0, -60 * s);
        ctx.lineTo(4 * s, -54 * s);
        ctx.closePath();
        ctx.fill();
  
        const bannerTime = time * 3;
        ctx.translate(0, -45 * s);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.moveTo(2 * s, 2 * s);
        for (let i = 0; i <= 25 * s; i += s) {
          const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
          ctx.lineTo(i + 2 * s, wave + 2 * s);
        }
        ctx.lineTo(27 * s, 18 * s + Math.sin(bannerTime + 25 * s * 0.18) * 5 * s);
        for (let i = 25 * s; i >= 0; i -= s) {
          const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
          ctx.lineTo(i + 2 * s, 18 * s + wave + 2 * s);
        }
        ctx.fill();
  
        ctx.fillStyle = "#8B0000";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i <= 25 * s; i += s) {
          const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
          ctx.lineTo(i, wave);
        }
        ctx.lineTo(25 * s, 18 * s + Math.sin(bannerTime + 25 * s * 0.18) * 5 * s);
        for (let i = 25 * s; i >= 0; i -= s) {
          const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
          ctx.lineTo(i, 18 * s + wave);
        }
        ctx.fill();
  
        ctx.fillStyle = "#B71C1C";
        ctx.beginPath();
        ctx.moveTo(2 * s, 2 * s);
        for (let i = 2 * s; i <= 23 * s; i += s) {
          const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
          ctx.lineTo(i, wave + 1 * s);
        }
        ctx.lineTo(23 * s, 16 * s + Math.sin(bannerTime + 23 * s * 0.18) * 5 * s);
        for (let i = 23 * s; i >= 2 * s; i -= s) {
          const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
          ctx.lineTo(i, 16 * s + wave + 1 * s);
        }
        ctx.fill();
  
        ctx.fillStyle = "#f97316";
        const crestX = 10 * s + Math.sin(bannerTime + 10 * s * 0.18) * 2 * s;
        ctx.beginPath();
        ctx.moveTo(crestX, 5 * s);
        ctx.lineTo(crestX - 5 * s, 7 * s);
        ctx.lineTo(crestX - 5 * s, 12 * s);
        ctx.lineTo(crestX, 15 * s);
        ctx.lineTo(crestX + 5 * s, 12 * s);
        ctx.lineTo(crestX + 5 * s, 7 * s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
  
        // Shield Emblem on Wall
        ctx.save();
        ctx.translate(0, doorY - 44 * s);
        ctx.fillStyle = "#37474F";
        ctx.beginPath();
        ctx.moveTo(0, -10 * s);
        ctx.lineTo(-8 * s, -6 * s);
        ctx.lineTo(-8 * s, 4 * s);
        ctx.quadraticCurveTo(0, 12 * s, 8 * s, 4 * s);
        ctx.lineTo(8 * s, -6 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(0, -7 * s);
        ctx.lineTo(-5 * s, -4 * s);
        ctx.lineTo(-5 * s, 2 * s);
        ctx.quadraticCurveTo(0, 8 * s, 5 * s, 2 * s);
        ctx.lineTo(5 * s, -4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#1a1a2e";
        ctx.font = `bold ${8 * s}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("P", 0, 0);
        ctx.restore();
  
        // Spawn Effect
        if (isSpawning) {
          const spawnCircleY = -w * tanA * 2;
          ctx.save();
          ctx.translate(0, spawnCircleY * 0.5);
          ctx.scale(1, 0.5);
          ctx.rotate(time * 2);
          ctx.strokeStyle = `rgba(79, 195, 247, ${1 - spawnCycle / 1500})`;
          ctx.lineWidth = 3 * s;
          ctx.setLineDash([8 * s, 4 * s]);
          ctx.beginPath();
          ctx.arc(0, 0, 45 * s, 0, Math.PI * 2);
          ctx.stroke();
          ctx.rotate(-time * 3);
          ctx.strokeStyle = `rgba(100, 220, 255, ${0.8 * (1 - spawnCycle / 1500)})`;
          ctx.setLineDash([4 * s, 8 * s]);
          ctx.beginPath();
          ctx.arc(0, 0, 30 * s, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
  
          const beamAlpha = 0.6 * (1 - spawnCycle / 1500);
          const beamGrad = ctx.createLinearGradient(0, doorY, 0, -120 * s);
          beamGrad.addColorStop(0, `rgba(79, 195, 247, ${beamAlpha})`);
          beamGrad.addColorStop(0.3, `rgba(100, 220, 255, ${beamAlpha * 0.7})`);
          beamGrad.addColorStop(1, "transparent");
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(-12 * s, doorY);
          ctx.lineTo(-8 * s, -120 * s);
          ctx.lineTo(8 * s, -120 * s);
          ctx.lineTo(12 * s, doorY);
          ctx.fill();
  
          for (let i = 0; i < 5; i++) {
            const px = (Math.sin(time * 4 + i * 1.5) * 15 - 7.5) * s;
            const py = doorY - 20 * s - ((time * 40 + i * 20) % 60) * s;
            const pAlpha = (1 - spawnCycle / 1500) * (0.5 + Math.sin(time * 10 + i) * 0.3);
            ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, 2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
        }
  
        break;
      }
    }
  
    ctx.restore();
  }
  