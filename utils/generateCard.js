const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const path = require("path");

/* ================= FONT ================= */
GlobalFonts.registerFromPath(
  path.join(__dirname, "fonts", "Inter-Bold.ttf"),
  "Inter"
);

/* ================= LOGO ================= */
const logoPath = path.join(__dirname, "assets", "logo.png");

const WIDTH = 900;
const HEIGHT = 420;

/* ================= COLORS ================= */
const COLORS = {
  accept: "#22c55e",
  reject: "#ef4444",
  waitlist: "#facc15",
};

/* ================= STATUS LABEL ================= */
const STATUS_LABELS = {
  accept: "ACCEPTED",
  reject: "REJECTED",
  waitlist: "WAITING LIST",
};

/* ================= MAIN ================= */
async function generateCard({ username, avatarUrl, status, applicationId }) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const color = COLORS[status] || "#22D3EE";
  const displayStatus = STATUS_LABELS[status] || "UNKNOWN";

  /* ================= BACKGROUND ================= */
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* ================= WATERMARK ================= */
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.translate(WIDTH / 2, HEIGHT / 2);
  ctx.rotate(-Math.PI / 6);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px Inter";
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

/* ================= HEADER BAR ================= */
ctx.fillStyle = color;
ctx.fillRect(30, 30, WIDTH - 60, 80);

/* ================= LOGO ================= */
let logoWidth = 130;
let logoHeight = 130;
let logoX = 45;
let logoY = 30 + (80 - logoHeight) / 2; // center vertically

try {
  const logo = await loadImage(logoPath);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // draw logo (bigger + centered)
  ctx.drawImage(
    logo,
    0, 0, logo.width, logo.height,
    logoX,
    logoY,
    logoWidth,
    logoHeight
  );

} catch (err) {
  console.log("⚠️ Logo load failed:", err.message);
}

/* ================= HEADER TEXT ================= */
const textStartX = logoX + logoWidth + 20;

ctx.fillStyle = "#000";
ctx.font = "bold 28px Inter";
ctx.fillText("MAANAGARAM CITY", textStartX, 65);

ctx.font = "16px Inter";
ctx.fillText("OFFICIAL IMMIGRATION DEPARTMENT", textStartX, 90);

  /* ================= STATUS BADGE ================= */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(650, 50, 200, 40);

  ctx.fillStyle = color;
  ctx.font = "bold 18px Inter";
  ctx.fillText(displayStatus, 665, 78);

  /* ================= LEFT PANEL ================= */
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(50, 140, 500, 200);

  /* ================= USER ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("FULL NAME", 70, 190);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Inter";
  ctx.fillText(username || "UNKNOWN", 70, 225);

  /* ================= APPLICATION ID ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("APPLICATION NUMBER", 70, 270);

  ctx.fillStyle = color;
  ctx.font = "bold 22px Inter";
  ctx.fillText(applicationId || "UNKNOWN", 70, 300);

  /* ================= STATUS TEXT ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("STATUS", 70, 330);

  ctx.fillStyle = color;
  ctx.font = "bold 22px Inter";
  ctx.fillText(displayStatus, 70, 360);

  /* ================= SECURITY STRIP ================= */
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(50, 360, 500, 6);
  ctx.globalAlpha = 1;

  /* ================= AVATAR ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    const size = 170;
    const x = 650;
    const y = 150;

    /* background plate */
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(x - 10, y - 10, size + 20, size + 20);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.clip();

    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    /* border */
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);

  } catch (err) {
    console.log("⚠️ Avatar load failed:", err.message);
  }

  /* ================= SIGNATURE ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "12px Inter";
  ctx.fillText("Authorized By Immigration Dept", 650, 350);

  ctx.beginPath();
  ctx.moveTo(650, 360);
  ctx.lineTo(820, 360);
  ctx.strokeStyle = "#64748b";
  ctx.stroke();

  /* ================= FOOTER ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "12px Inter";
  ctx.fillText(
    "Issued by Maanagaram City Authority • Immigration Division",
    60,
    395
  );

  return {
    buffer: canvas.toBuffer("image/png"),
  };
}

module.exports = generateCard;
