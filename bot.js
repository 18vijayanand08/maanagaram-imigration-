require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

/* =========================
   ✅ BOT READY
========================= */
client.once("clientReady", () => {
  console.log(`🤖 Bot running as ${client.user.tag}`);
});

/* =========================
   🔘 BUTTON HANDLER
========================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, userId] = interaction.customId.split("_");

  try {
    // ✅ IMMEDIATE ACK (prevents timeout)
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate();
    }

    // 🔍 Fetch member safely
    const member = await interaction.guild.members
      .fetch(userId)
      .catch(() => null);

    if (!member) {
      return interaction.editReply({
        content: "⚠️ User not found in server.",
        components: [],
      });
    }

    /* ================= ACCEPT ================= */
    if (action === "accept") {
      try {
        await member.roles.add(process.env.ROLE_ID);
      } catch (roleErr) {
        console.error("❌ Role Error:", roleErr);

        return interaction.editReply({
          content: "⚠️ Failed to assign role. Check bot permissions.",
          components: [],
        });
      }

      const visaChannel = await client.channels
        .fetch(process.env.VISA_CHANNEL_ID)
        .catch(() => null);

      if (visaChannel) {
        await visaChannel.send(
          `🎉 <@${userId}> your visa has been accepted! Welcome to Maanagaram.`
        );
      }

      return interaction.editReply({
        content: `✅ Accepted <@${userId}>`,
        components: [],
      });
    }

    /* ================= REJECT ================= */
    if (action === "reject") {
      return interaction.editReply({
        content: `❌ Rejected <@${userId}>`,
        components: [],
      });
    }

  } catch (err) {
    console.error("❌ Button Error:", err);

    try {
      await interaction.editReply({
        content: "⚠️ Something went wrong.",
        components: [],
      });
    } catch {}
  }
});

/* =========================
   🚨 GLOBAL ERROR HANDLER (VERY IMPORTANT)
========================= */
client.on("error", (err) => {
  console.error("🔥 Client Error:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
});

/* =========================
   🔐 LOGIN
========================= */
client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = client;
