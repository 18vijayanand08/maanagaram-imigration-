const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const path = require("path");

/* ================= FONT ================= */
GlobalFonts.registerFromPath(
  path.join(__dirname, "fonts", "Inter-Bold.ttf"),
  "Inter"
);

/* ================= ASSETS ================= */
const logoPath = path.join(__dirname, "assets", "logo.png"); // ✅ seal removed

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

  /* ================= LEFT PANEL (BIG LOGO AREA) ================= */
  ctx.fillStyle = "#041020";
  ctx.fillRect(30, 30, 300, HEIGHT - 60);

  /* ================= BIG LOGO (NO BLUR) ================= */
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
  ctx.fillStyle = color;
  ctx.font = "bold 20px Inter";
  ctx.textAlign = "center";
  ctx.fillText("MAANAGARAM CITY", 180, 320);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("IMMIGRATION AUTHORITY", 180, 345);

  ctx.textAlign = "left";

  /* ================= RIGHT PANEL ================= */
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(350, 30, WIDTH - 380, HEIGHT - 60);

  /* ================= STATUS BADGE ================= */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(WIDTH - 230, 50, 180, 40);

  ctx.fillStyle = color;
  ctx.font = "bold 18px Inter";
  ctx.fillText(displayStatus, WIDTH - 215, 78);

  /* ================= TITLE ================= */
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Inter";
  ctx.fillText("IMMIGRATION ID CARD", 370, 100);

  /* ================= USER INFO ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("FULL NAME", 370, 150);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Inter";
  ctx.fillText(realName || "UNKNOWN", 370, 180);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("USERNAME", 370, 230);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Inter";
  ctx.fillText(username || "UNKNOWN", 370, 260);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("APPLICATION ID", 370, 310);

  ctx.fillStyle = color;
  ctx.font = "bold 22px Inter";
  ctx.fillText(applicationId || "UNKNOWN", 370, 340);

  /* ================= AVATAR ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    const size = 130;
    const x = WIDTH - size - 50;
    const y = 160;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x - 10, y - 10, size + 20, size + 20);

    ctx.drawImage(avatar, x, y, size, size);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);

  } catch (err) {
    console.log("⚠️ Avatar load failed:", err.message);
  }

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
