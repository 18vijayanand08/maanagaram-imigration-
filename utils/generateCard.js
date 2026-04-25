const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const path = require("path");

/* ================= FONT ================= */
GlobalFonts.registerFromPath(
  path.join(__dirname, "fonts", "Inter-Bold.ttf"),
  "Inter"
);

const WIDTH = 900;
const HEIGHT = 420;

/* ================= COLORS ================= */
const COLORS = {
  accept: "#22c55e",
  reject: "#ef4444",
  waitlist: "#facc15",
};

/* ================= MAIN ================= */
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

  /* ================= OUTER GLOW BORDER ================= */
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

  ctx.shadowBlur = 0;

  /* ================= INNER CARD ================= */
  const cardGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  cardGradient.addColorStop(0, "rgba(255,255,255,0.05)");
  cardGradient.addColorStop(1, "rgba(255,255,255,0.02)");

  ctx.fillStyle = cardGradient;
  ctx.fillRect(30, 30, WIDTH - 60, HEIGHT - 60);

  /* ================= HEADER ================= */
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Inter";
  ctx.fillText("MAANAGARAM RP", 60, 80);

  ctx.fillStyle = "#64748b";
  ctx.font = "16px Inter";
  ctx.fillText("IMMIGRATION DEPARTMENT", 60, 105);

  /* ================= STATUS BADGE ================= */
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;

  ctx.fillStyle = color;
  ctx.fillRect(60, 130, 200, 45);

  ctx.shadowBlur = 0;

  ctx.fillStyle = "#000";
  ctx.font = "bold 20px Inter";
  ctx.fillText(status.toUpperCase(), 75, 160);

  /* ================= LEFT PANEL ================= */
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(50, 190, 480, 170);

  /* ================= USER ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "15px Inter";
  ctx.fillText("APPLICANT NAME", 70, 230);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Inter";
  ctx.fillText(username || "UNKNOWN", 70, 260);

  /* ================= APP ID ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "15px Inter";
  ctx.fillText("APPLICATION ID", 70, 300);

  ctx.fillStyle = color;
  ctx.font = "bold 22px Inter";
  ctx.fillText(applicationId || "UNKNOWN", 70, 330);

  /* ================= SECURITY STRIP ================= */
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(50, 350, 480, 8);
  ctx.globalAlpha = 1;

  /* ================= AVATAR SECTION ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    const size = 170;
    const x = 640;
    const y = 120;

    /* Glow background circle */
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();

    ctx.shadowBlur = 0;

    /* Avatar clip */
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    /* Ring */
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();

  } catch (err) {
    console.log("⚠️ Avatar load failed:", err.message);
  }

  /* ================= RIGHT TEXT ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("STATUS", 640, 320);

  ctx.fillStyle = color;
  ctx.font = "bold 22px Inter";
  ctx.fillText(status.toUpperCase(), 640, 350);

  /* ================= FOOTER ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "13px Inter";
  ctx.fillText("Maanagaram RP • Secure Immigration System", 60, 390);

  return {
    buffer: canvas.toBuffer("image/png"),
  };
}

module.exports = generateCard;
