require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const client = require("./bot");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   🔐 DISCORD LOGIN (OAuth)
========================= */
app.get("/auth/discord", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({ error: "No code provided" });
    }

    // 🔥 USE ENV BASED REDIRECT
    const redirectUri =
  process.env.NODE_ENV === "production"
    ? "https://maanagaram.netlify.app/auth/callback"
    : "http://localhost:5173/auth/callback";

    const params = new URLSearchParams();
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);

    /* ================= TOKEN ================= */
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    /* ================= USER ================= */
    const userRes = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokenRes.data.access_token}`,
        },
      }
    );

    return res.json(userRes.data);

  } catch (err) {
    console.error("❌ OAuth Error:", err.response?.data || err.message);

    return res.status(500).json({
      error: "OAuth failed",
      details: err.response?.data || err.message,
    });
  }
});

/* =========================
   📝 APPLY ROUTE
========================= */
app.post("/apply", async (req, res) => {
  try {
    const { username, discordId, avatar, answers } = req.body;

    /* ================= VALIDATION ================= */
    if (!username || !discordId || !answers?.q1 || !answers?.q2) {
      return res.status(400).json({ error: "Missing fields" });
    }

    /* ================= CHANNEL ================= */
    const channel = await client.channels.fetch(
      process.env.APPLICATION_CHANNEL_ID
    );

    if (!channel) {
      return res.status(500).json({ error: "Channel not found" });
    }

    /* ================= AVATAR ================= */
    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(discordId) % 5}.png`;

    /* ================= SEND ================= */
    await channel.send({
      content: `📥 New Application from <@${discordId}>`,
      embeds: [
        {
          title: "📄 Green Card Application",
          color: 0x22d3ee,

          fields: [
            {
              name: "👤 Username",
              value: username,
              inline: true,
            },
            {
              name: "🆔 Discord ID",
              value: discordId,
              inline: true,
            },
            {
              name: "📌 Why join?",
              value: answers.q1.substring(0, 1024),
            },
            {
              name: "🎮 Experience",
              value: answers.q2.substring(0, 1024),
            },
          ],

          thumbnail: {
            url: avatarUrl,
          },

          footer: {
            text: "Maanagaram RP • Application System",
          },

          timestamp: new Date(),
        },
      ],

      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "Accept",
              style: 3,
              custom_id: `accept_${discordId}`,
            },
            {
              type: 2,
              label: "Reject",
              style: 4,
              custom_id: `reject_${discordId}`,
            },
          ],
        },
      ],
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("❌ Apply Error:", err);

    return res.status(500).json({
      error: "Application failed",
      details: err.message,
    });
  }
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
