const { createCanvas, loadImage } = require("@napi-rs/canvas");

const WIDTH = 900;
const HEIGHT = 400;

/* ================= COLORS ================= */
const COLORS = {
  accept: "#22c55e",   // green
  reject: "#ef4444",   // red
  waitlist: "#facc15", // yellow
};

/* ================= GENERATE APP ID ================= */
function generateAppId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return (
    "MC-" +
    Array.from({ length: 6 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("")
  );
}

/* ================= MAIN FUNCTION ================= */
async function generateCard({ username, avatarUrl, status }) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const color = COLORS[status] || "#22D3EE";
  const appId = generateAppId();

  /* ================= BACKGROUND ================= */
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#020617");
  gradient.addColorStop(1, "#0B1120");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* ================= GLOW BORDER ================= */
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;

  ctx.shadowColor = color;
  ctx.shadowBlur = 25;

  ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

  ctx.shadowBlur = 0;

  /* ================= TITLE ================= */
  ctx.fillStyle = color;
  ctx.font = "bold 34px Sans";
  ctx.fillText("MAANAGARAM RP VISA", 40, 60);

  /* ================= STATUS ================= */
  ctx.font = "bold 28px Sans";
  ctx.fillText(status.toUpperCase(), 40, 110);

  /* ================= USERNAME ================= */
  ctx.fillStyle = "#ffffff";
  ctx.font = "24px Sans";
  ctx.fillText(`User: ${username}`, 40, 170);

  /* ================= APPLICATION ID ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "20px Sans";
  ctx.fillText(`Application ID: ${appId}`, 40, 210);

  /* ================= DECOR LINE ================= */
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 230);
  ctx.lineTo(500, 230);
  ctx.stroke();

  /* ================= AVATAR ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    ctx.save();

    ctx.beginPath();
    ctx.arc(720, 200, 80, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatar, 640, 120, 160, 160);

    ctx.restore();

    /* Avatar border */
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(720, 200, 80, 0, Math.PI * 2);
    ctx.stroke();

  } catch (err) {
    console.log("⚠️ Avatar load failed:", err.message);
  }

  /* ================= FOOTER ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "16px Sans";
  ctx.fillText("Maanagaram Roleplay • Immigration System", 40, 360);

  /* ================= RETURN ================= */
  return {
    buffer: canvas.toBuffer("image/png"),
    appId,
  };
}

module.exports = generateCard;