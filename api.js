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

    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://maanagaram.netlify.app/auth/callback"
        : "http://localhost:5173/auth/callback";

    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    /* 🔑 GET TOKEN */
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000,
      }
    );

    const accessToken = tokenRes.data.access_token;

    /* 👤 GET USER */
    const userRes = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );

    const discordUser = userRes.data;

    /* =========================
       🛡️ GUILD + ROLE CHECK
    ========================= */
    const GUILD_ID = process.env.GUILD_ID;
    const ROLE_ID = process.env.APPROVED_ROLE_ID;

    let memberRes;

    try {
      memberRes = await axios.get(
        `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );
    } catch (err) {
      // ❌ NOT IN SERVER
      if (err.response?.status === 404) {
        return res.json({ status: "NOT_IN_SERVER" });
      }

      console.error("❌ Member fetch error:", err.response?.data || err.message);
      return res.status(500).json({ error: "Guild fetch failed" });
    }

    const member = memberRes.data;

    // ❌ ALREADY HAS ROLE
    if (member.roles.includes(ROLE_ID)) {
      return res.json({ status: "ALREADY_APPROVED" });
    }

    /* ✅ NORMAL USER */
    return res.json({
      status: "OK",
      user: {
        id: discordUser.id,
        username: discordUser.username,
        avatar: discordUser.avatar,
      },
    });

  } catch (err) {
    console.error("❌ OAuth Error:", err.response?.data || err.message);

    return res.status(500).json({
      error: "OAuth failed",
      details: err.response?.data || err.message,
    });
  }
});

/* =========================
   🆔 GENERATE APPLICATION ID
========================= */
const generateApplicationId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "MCRP-";

  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  return id;
};

/* =========================
   📝 APPLY ROUTE
========================= */
app.post("/apply", async (req, res) => {
  try {
    const { username, discordId, avatar, answers } = req.body;

    if (!username || !discordId || !answers) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const required = ["q1","q2","q3","q4","q5","q6","q7","q8"];

    for (const q of required) {
      if (!answers[q] || answers[q].trim() === "") {
        return res.status(400).json({ error: `Missing ${q}` });
      }
    }

    const applicationId = generateApplicationId();

    const channel = await client.channels
      .fetch(process.env.APPLICATION_CHANNEL_ID)
      .catch(() => null);

    if (!channel) {
      console.error("❌ Channel not found");
      return res.status(500).json({ error: "Channel not found" });
    }

    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(discordId) % 5}.png`;

    const safe = (text) =>
      text.length > 1024 ? text.substring(0, 1020) + "..." : text;

    const embed = {
      title: "📄 Green Card Application",
      color: 0x22d3ee,

      fields: [
        { name: "🆔 Application ID", value: applicationId },

        { name: "👤 Username", value: username, inline: true },
        { name: "🆔 Discord ID", value: discordId, inline: true },

        { name: "1️⃣ Real Name", value: safe(answers.q1) },
        { name: "2️⃣ Real Age", value: safe(answers.q2) },

        { name: "3️⃣ Vehicle Deathmatch", value: safe(answers.q3) },
        { name: "4️⃣ Random Deathmatch", value: safe(answers.q4) },
        { name: "5️⃣ Combat Logging", value: safe(answers.q5) },
        { name: "6️⃣ Powergaming", value: safe(answers.q6) },
        { name: "7️⃣ Metagaming", value: safe(answers.q7) },
        { name: "8️⃣ Rule Violation Action", value: safe(answers.q8) },
      ],

      thumbnail: { url: avatarUrl },

      footer: {
        text: "Maanagaram RP • Application System",
      },

      timestamp: new Date(),
    };

    await channel.send({
      content: `📥 New Application from <@${discordId}>\n<@&${process.env.IMMIGRATION_ROLE_ID}>`,
      embeds: [embed],

      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "Accept",
              style: 3,
              custom_id: `accept_${discordId}_${applicationId}`,
            },
            {
              type: 2,
              label: "Reject",
              style: 4,
              custom_id: `reject_${discordId}_${applicationId}`,
            },
            {
              type: 2,
              label: "Wait List",
              style: 2,
              custom_id: `waitlist_${discordId}_${applicationId}`,
            },
          ],
        },
      ],
    });

    console.log(`✅ Application sent for ${username} | ${applicationId}`);

    return res.json({
      success: true,
      applicationId,
    });

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

  console.log("ENV CHECK:", {
    CLIENT_ID: !!process.env.CLIENT_ID,
    CLIENT_SECRET: !!process.env.CLIENT_SECRET,
    BOT_TOKEN: !!process.env.DISCORD_BOT_TOKEN,
    CHANNEL_ID: !!process.env.APPLICATION_CHANNEL_ID,
  });
});
