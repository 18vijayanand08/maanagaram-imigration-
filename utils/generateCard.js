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
  ctx.globalAlpha = 0.05;
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
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(30, 30, WIDTH - 60, HEIGHT - 60);

  /* ================= HEADER ================= */
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Inter";
  ctx.textAlign = "left";
  ctx.fillText("MAANAGARAM CITY", 60, 70);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px Inter";
  ctx.fillText("OFFICIAL IMMIGRATION DEPARTMENT", 60, 95);

  /* ================= STATUS BADGE ================= */
  ctx.fillStyle = color;
  ctx.fillRect(60, 120, 220, 45);

  ctx.fillStyle = "#000";
  ctx.font = "bold 20px Inter";
  ctx.fillText(displayStatus, 75, 150);

  /* ================= LEFT PANEL ================= */
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(50, 180, 500, 170);

  /* ================= USER ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("FULL NAME", 70, 220);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Inter";
  ctx.fillText(username || "UNKNOWN", 70, 250);

  /* ================= APPLICATION ID ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("APPLICATION NUMBER", 70, 290);

  ctx.fillStyle = color;
  ctx.font = "bold 22px Inter";
  ctx.fillText(applicationId || "UNKNOWN", 70, 320);

  /* ================= SECURITY STRIP ================= */
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(50, 350, 500, 8);
  ctx.globalAlpha = 1;

  /* ================= AVATAR ================= */
  try {
    const avatar = await loadImage(avatarUrl);

    const size = 170;
    const x = 650;
    const y = 110;

    ctx.save();

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(avatar, x, y, size, size);

    ctx.restore();

    /* Border ring */
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

  /* ================= RIGHT STATUS ================= */
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px Inter";
  ctx.fillText("STATUS", 650, 310);

  ctx.fillStyle = color;
  ctx.font = "bold 22px Inter";
  ctx.fillText(displayStatus, 650, 340);

  /* ================= FOOTER ================= */
  ctx.fillStyle = "#64748b";
  ctx.font = "12px Inter";
  ctx.fillText(
    "Issued by Maanagaram City Authority • Immigration Division",
    60,
    390
  );

  return {
    buffer: canvas.toBuffer("image/png"),
  };
}

module.exports = generateCard;
