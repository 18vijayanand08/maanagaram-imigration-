const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const path = require("path");

/* ================= REGISTER FONT ================= */
GlobalFonts.registerFromPath(
  path.join(__dirname, "fonts", "Inter-Bold.ttf"),
  "Inter"
);

const WIDTH = 900;
const HEIGHT = 400;

/* ================= COLORS ================= */
const COLORS = {
  accept: "#22c55e",
  reject: "#ef4444",
  waitlist: "#facc15",
};

/* ================= MAIN FUNCTION ================= */
async function generateCard({ username, avatarUrl, status, applicationId }) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const color = COLORS[status] || "#22D3EE";

  /* ================= BACKGROUND ================= */
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, "#020617");
  bg.addColorStop(1, "#020617");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* ================= BORDER ================= */
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  ctx.shadowColor = color;
  ctx.shadowBlur = 20;

  ctx.strokeRect(8, 8, WIDTH - 16, HEIGHT - 16);

  ctx.shadowBlur = 0;

  /* ================= GLASS PANEL ================= */
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(40, 90, 520, 260);

  /* ================= TITLE ================= */
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px Inter";
  ctx.fillText("MAANAGARAM RP", 50, 60);

  /* ================= STATUS BADGE ================= */
  ctx.fillStyle = color;
  ctx.fillRect(50, 100, 170, 45);

  ctx.fillStyle = "#000";
  ctx.font = "bold 20px Inter";
  ctx.fillText(status.toUpperCase(), 65, 130);

  /* ================= USER ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px Inter";
  ctx.fillText("APPLICANT", 50, 190);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Inter";
  ctx.fillText(username || "UNKNOWN", 50, 225);

  /* ================= APP ID ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "15px Inter";
  ctx.fillText("APPLICATION ID", 50, 270);

  ctx.fillStyle = color;
  ctx.font = "bold 22px Inter";
  ctx.fillText(applicationId || "UNKNOWN", 50, 300);

  /* ================= DIVIDER ================= */
  ctx.strokeStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(50, 320);
  ctx.lineTo(540, 320);
  ctx.stroke();

  /* ================= AVATAR ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    const size = 180;
    const x = 650;
    const y = 110;

    ctx.save();

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatar, x, y, size, size);

    ctx.restore();

    /* Glow ring */
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;

  } catch (err) {
    console.log("⚠️ Avatar load failed:", err.message);
  }

  /* ================= FOOTER ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "14px Inter";
  ctx.fillText("Maanagaram RP • Immigration System", 50, 370);

  return {
    buffer: canvas.toBuffer("image/png"),
  };
}

module.exports = generateCard;