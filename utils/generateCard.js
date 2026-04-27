const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const path = require("path");

/* ================= FONT ================= */
GlobalFonts.registerFromPath(
  path.join(__dirname, "fonts", "Inter-Bold.ttf"),
  "Inter"
);

/* ================= ASSETS ================= */
const logoPath = path.join(__dirname, "assets", "logo.png");
const sealPath = path.join(__dirname, "assets", "seal.png");

const WIDTH = 900;
const HEIGHT = 420;

/* ================= COLORS ================= */
const COLORS = {
  accept: "#22c55e",
  reject: "#ef4444",
  waitlist: "#facc15",
};

const STATUS_LABELS = {
  accept: "ACCEPTED",
  reject: "REJECTED",
  waitlist: "WAITING LIST",
};

/* ================= MAIN ================= */
async function generateCard({
  username,
  realName,
  avatarUrl,
  status,
  applicationId
}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const color = COLORS[status] || "#22D3EE";
  const displayStatus = STATUS_LABELS[status] || "UNKNOWN";

  /* ================= QUALITY ================= */
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  /* ================= BACKGROUND ================= */
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* ================= WATERMARK ================= */
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.translate(WIDTH / 2, HEIGHT / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 90px Inter";
  ctx.textAlign = "center";
  ctx.fillText("MAANAGARAM CITY", 0, 0);
  ctx.restore();

  /* ================= BORDER ================= */
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);
  ctx.shadowBlur = 0;

  /* ================= INNER CARD ================= */
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(30, 30, WIDTH - 60, HEIGHT - 60);

  /* ================= HEADER ================= */
  ctx.fillStyle = color;
  ctx.fillRect(30, 30, WIDTH - 60, 80);

  /* ================= LOGO (SHARP + BIGGER) ================= */
  try {
    const logo = await loadImage(logoPath);

    const maxSize = 100;
    const x = 50;
    const y = 40;

    const scale = Math.min(maxSize / logo.width, maxSize / logo.height);
    const w = logo.width * scale;
    const h = logo.height * scale;

    ctx.drawImage(logo, x, y, w, h);
  } catch (err) {
    console.log("⚠️ Logo load failed:", err.message);
  }

  /* ================= HEADER TEXT ================= */
  ctx.fillStyle = "#000";
  ctx.font = "bold 30px Inter";
  ctx.fillText("MAANAGARAM CITY", 170, 65);

  ctx.font = "16px Inter";
  ctx.fillStyle = "#022c22";
  ctx.fillText("OFFICIAL IMMIGRATION DEPARTMENT", 170, 90);

  /* ================= STATUS BADGE ================= */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(650, 50, 200, 40);

  ctx.fillStyle = color;
  ctx.font = "bold 18px Inter";
  ctx.fillText(displayStatus, 665, 78);

  /* ================= LEFT PANEL ================= */
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(50, 140, 500, 200);

  /* ================= TEXT ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("FULL NAME", 70, 185);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Inter";
  ctx.fillText(realName || "UNKNOWN", 70, 215);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("USERNAME", 70, 255);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Inter";
  ctx.fillText(username || "UNKNOWN", 70, 285);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("APPLICATION NUMBER", 70, 325);

  ctx.fillStyle = color;
  ctx.font = "bold 20px Inter";
  ctx.fillText(applicationId || "UNKNOWN", 70, 355);

  /* ================= AVATAR (PROPER ALIGNMENT) ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    const size = 160;
    const x = 660;
    const y = 135;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x - 12, y - 12, size + 24, size + 24);

    ctx.drawImage(avatar, x, y, size, size);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
  } catch (err) {
    console.log("⚠️ Avatar load failed:", err.message);
  }

  /* ================= SIGNATURE ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px Inter";
  ctx.fillText("Authorized by Immigration Dept", 650, 310);

  ctx.beginPath();
  ctx.moveTo(650, 320);
  ctx.lineTo(820, 320);
  ctx.strokeStyle = "#475569";
  ctx.stroke();

  /* ================= GOVT SEAL (CRISP + OVERLAP) ================= */
  try {
    const seal = await loadImage(sealPath);

    const sealSize = 110;
    const x = 735;
    const y = 260;

    const scale = Math.min(sealSize / seal.width, sealSize / seal.height);
    const w = seal.width * scale;
    const h = seal.height * scale;

    ctx.globalAlpha = 0.95;
    ctx.drawImage(seal, x, y, w, h);
    ctx.globalAlpha = 1;
  } catch (err) {
    console.log("⚠️ Seal load failed:", err.message);
  }

  /* ================= FOOTER ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "12px Inter";
  ctx.fillText(
    "Issued by Maanagaram City Authority • Immigration Division",
    60,
    405
  );

  return {
    buffer: canvas.toBuffer("image/png"),
  };
}

module.exports = generateCard;
