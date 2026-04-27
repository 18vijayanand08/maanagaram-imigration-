const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const path = require("path");

/* ================= FONT ================= */
GlobalFonts.registerFromPath(
  path.join(__dirname, "fonts", "Inter-Bold.ttf"),
  "Inter"
);

/* ================= ASSETS ================= */
const logoPath = path.join(__dirname, "assets", "logo.png");

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

/* ================= BARCODE FUNCTION ================= */
function drawBarcode(ctx, x, y, width, height, text) {
  let currentX = x;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);

    const barWidth = (charCode % 3) + 1; // variable thickness

    ctx.fillStyle = "#d4af37"; // gold
    ctx.fillRect(currentX, y, barWidth, height);

    currentX += barWidth + 2;
  }
}

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

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  /* ================= BACKGROUND ================= */
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* ================= BORDER ================= */
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);
  ctx.shadowBlur = 0;

  /* ================= MAIN CARD ================= */
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(30, 30, WIDTH - 60, HEIGHT - 60);

  /* ================= LEFT PANEL ================= */
  ctx.fillStyle = "#041020";
  ctx.fillRect(30, 30, 300, HEIGHT - 60);

  /* ================= LOGO ================= */
  try {
    const logo = await loadImage(logoPath);

    const maxW = 240;
    const maxH = 240;

    const scale = Math.min(maxW / logo.width, maxH / logo.height);
    const w = logo.width * scale;
    const h = logo.height * scale;

    const x = 30 + (300 - w) / 2;
    const y = 80;

    ctx.drawImage(logo, x, y, w, h);

  } catch (err) {
    console.log("⚠️ Logo load failed:", err.message);
  }

  /* ================= LOGO TEXT ================= */
  ctx.fillStyle = "#d4af37"; // gold
  ctx.font = "bold 20px Inter";
  ctx.textAlign = "center";
  ctx.fillText("MAANAGARAM CITY", 180, 320);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("IMMIGRATION AUTHORITY", 180, 345);

  ctx.textAlign = "left";

  /* ================= RIGHT PANEL ================= */
  ctx.fillStyle = "#020617";
  ctx.fillRect(350, 30, WIDTH - 380, HEIGHT - 60);

  /* ================= HEADER ================= */
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 28px Inter";
  ctx.fillText("IMMIGRATION PASS", 370, 80);

  /* ================= STATUS ================= */
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px Inter";
  ctx.fillText("STATUS", 370, 120);

  ctx.fillStyle = color;
  ctx.font = "bold 20px Inter";
  ctx.fillText(displayStatus, 370, 145);

  /* ================= AVATAR ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    const size = 110;
    const x = WIDTH - size - 60;
    const y = 60;

    ctx.drawImage(avatar, x, y, size, size);

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

  } catch (err) {
    console.log("⚠️ Avatar load failed:", err.message);
  }

  /* ================= DIVIDER ================= */
  ctx.beginPath();
  ctx.moveTo(350, 170);
  ctx.lineTo(WIDTH - 30, 170);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.stroke();

  /* ================= INFO ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px Inter";

  ctx.fillText("FULL NAME", 370, 210);
  ctx.fillText("USERNAME", 370, 260);
  ctx.fillText("APPLICATION ID", 370, 310);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Inter";
  ctx.fillText(realName || "UNKNOWN", 370, 235);

  ctx.font = "bold 18px Inter";
  ctx.fillText(username || "UNKNOWN", 370, 285);

  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 18px Inter";
  ctx.fillText(applicationId || "UNKNOWN", 370, 335);

  /* ================= BARCODE ================= */
  const barcodeX = 520;
  const barcodeY = 240;

  drawBarcode(ctx, barcodeX, barcodeY, 250, 50, applicationId || "123456");

  ctx.strokeStyle = "#d4af37";
  ctx.strokeRect(barcodeX - 10, barcodeY - 10, 270, 80);

  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 12px Inter";
  ctx.fillText("MAANAGARAM CITY", barcodeX, barcodeY + 70);

  /* ================= FOOTER ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "12px Inter";
  ctx.fillText(
    "Issued by Maanagaram City Authority • Immigration Division",
    40,
    HEIGHT - 20
  );

  return {
    buffer: canvas.toBuffer("image/png"),
  };
}

module.exports = generateCard;
