require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

/* =========================
   READY
========================= */
client.once("clientReady", () => {
  console.log(`🤖 Bot running as ${client.user.tag}`);
});

/* =========================
   SAFE EDIT FUNCTION
========================= */
const safeEdit = async (interaction, data) => {
  try {
    await interaction.editReply(data);
  } catch (err) {
    console.error("❌ Edit failed:", err.message);
  }
};

/* =========================
   BUTTON HANDLER
========================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, userId] = interaction.customId.split("_");

  try {
    // ✅ ACKNOWLEDGE (prevents timeout)
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate();
    }

    const member = await interaction.guild.members
      .fetch(userId)
      .catch(() => null);

    if (!member) {
      return safeEdit(interaction, {
        content: "⚠️ User not found in server.",
        components: [],
      });
    }

    /* ================= ACCEPT ================= */
    if (action === "accept") {
      if (!member.manageable) {
        return safeEdit(interaction, {
          content: "⚠️ Cannot modify user (role hierarchy issue).",
          components: [],
        });
      }

      try {
        await member.roles.add(process.env.ROLE_ID);
      } catch (err) {
        return safeEdit(interaction, {
          content: "⚠️ Failed to assign role.",
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

      // ❌ REMOVE BUTTONS
      await interaction.message.edit({ components: [] });

      return safeEdit(interaction, {
        content: `✅ Accepted <@${userId}> by ${interaction.user.tag}`,
        components: [],
      });
    }

    /* ================= REJECT ================= */
    if (action === "reject") {
      const rejectChannel = await client.channels
        .fetch(process.env.REJECT_CHANNEL_ID)
        .catch(() => null);

      if (rejectChannel) {
        await rejectChannel.send(
          `❌ <@${userId}> Sorry your application is rejected due to missing requirements.\nPlease take help from <@&${process.env.IMMIGRATION_ROLE_ID}>`
        );
      }

      // ❌ REMOVE BUTTONS
      await interaction.message.edit({ components: [] });

      return safeEdit(interaction, {
        content: `❌ Rejected <@${userId}> by ${interaction.user.tag}`,
        components: [],
      });
    }

    /* ================= WAITLIST ================= */
    if (action === "waitlist") {
      try {
        await member.roles.add(process.env.PENDING_ROLE_ID);
      } catch (err) {
        console.error("❌ Pending role error:", err);
      }

      const waitChannel = await client.channels
        .fetch(process.env.WAITING_CHANNEL_ID)
        .catch(() => null);

      if (waitChannel) {
        await waitChannel.send(
          `⏳ <@${userId}> your application is in waiting list.\nJoin <#${process.env.WAITING_VC_ID}> to complete your visa process.`
        );
      }

      // ✅ KEEP BUTTONS
      return safeEdit(interaction, {
        content: `⏳ <@${userId}> moved to waiting list by ${interaction.user.tag}`,
        components: interaction.message.components,
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
   GLOBAL ERROR HANDLER
========================= */
client.on("error", (err) => {
  console.error("🔥 Client Error:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
});

/* =========================
   LOGIN
========================= */
client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = client;
