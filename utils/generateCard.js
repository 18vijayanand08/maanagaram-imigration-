const { createCanvas, loadImage } = require("@napi-rs/canvas");

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
  bg.addColorStop(1, "#0B1120");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* ================= GLOW BORDER ================= */
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;

  ctx.shadowColor = color;
  ctx.shadowBlur = 25;

  ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

  ctx.shadowBlur = 0;

  /* ================= GLASS PANEL ================= */
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(30, 80, 520, 260);

  /* ================= RESET SHADOW (IMPORTANT) ================= */
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  /* ================= TITLE ================= */
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("MAANAGARAM RP", 40, 60);

  /* ================= STATUS BADGE ================= */
  ctx.fillStyle = color;
  ctx.fillRect(40, 90, 160, 40);

  ctx.fillStyle = "#000";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText(status.toUpperCase(), 55, 118);

  /* ================= USER LABEL ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "18px sans-serif";
  ctx.fillText("APPLICANT", 40, 170);

  /* ================= USERNAME ================= */
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(username, 40, 205);

  /* ================= APPLICATION ID LABEL ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px sans-serif";
  ctx.fillText("APPLICATION ID", 40, 260);

  /* ================= APPLICATION ID ================= */
  ctx.fillStyle = color;
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(applicationId || "UNKNOWN", 40, 290);

  /* ================= DIVIDER ================= */
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 310);
  ctx.lineTo(520, 310);
  ctx.stroke();

  /* ================= AVATAR ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    const x = 650;
    const y = 110;
    const size = 180;

    ctx.save();

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatar, x, y, size, size);

    ctx.restore();

    /* Avatar glow */
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;

    ctx.shadowColor = color;
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;

  } catch (err) {
    console.log("⚠️ Avatar load failed:", err.message);
  }

  /* ================= FOOTER ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "14px sans-serif";
  ctx.fillText("Maanagaram RP • Immigration System", 40, 370);

  /* ================= RETURN ================= */
  return {
    buffer: canvas.toBuffer("image/png"),
  };
}

module.exports = generateCard;
