require("dotenv").config();
const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const generateCard = require("./utils/generateCard");

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
   SAFE EDIT
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

  const [action, userId, applicationId] = interaction.customId.split("_");

  try {
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

    if (!member.manageable) {
      return safeEdit(interaction, {
        content: "⚠️ Cannot modify user (role hierarchy issue).",
        components: [],
      });
    }

    const avatarUrl = member.user.displayAvatarURL({
      extension: "png",
      size: 512,
    });

    /* ================= ACCEPT ================= */
    if (action === "accept") {
      try {
        await member.roles.add(process.env.ROLE_ID);

        // remove pending role if exists
        if (member.roles.cache.has(process.env.PENDING_ROLE_ID)) {
          await member.roles.remove(process.env.PENDING_ROLE_ID);
        }
      } catch (err) {
        console.error("❌ Accept role error:", err);

        return safeEdit(interaction, {
          content: "⚠️ Failed to update roles.",
          components: [],
        });
      }

      const { buffer } = await generateCard({
        username: member.user.username,
        avatarUrl,
        status: "accept",
      });

      const attachment = new AttachmentBuilder(buffer, {
        name: "accepted.png",
      });

      const visaChannel = await client.channels
        .fetch(process.env.VISA_CHANNEL_ID)
        .catch(() => null);

      if (visaChannel) {
        await visaChannel.send({
          content: `🎉 <@${userId}> your visa has been accepted!\n🆔 Application ID: **${applicationId}**`,
          files: [attachment],
        });
      }

      // remove buttons
      await interaction.message.edit({ components: [] });

      return safeEdit(interaction, {
        content: `✅ Accepted <@${userId}> | 🆔 ${applicationId}`,
        components: [],
      });
    }

    /* ================= REJECT ================= */
    if (action === "reject") {
      try {
        if (member.roles.cache.has(process.env.PENDING_ROLE_ID)) {
          await member.roles.remove(process.env.PENDING_ROLE_ID);
        }
      } catch (err) {
        console.error("❌ Reject role error:", err);
      }

      const { buffer } = await generateCard({
        username: member.user.username,
        avatarUrl,
        status: "reject",
      });

      const attachment = new AttachmentBuilder(buffer, {
        name: "rejected.png",
      });

      const rejectChannel = await client.channels
        .fetch(process.env.REJECT_CHANNEL_ID)
        .catch(() => null);

      if (rejectChannel) {
        await rejectChannel.send({
          content: `❌ <@${userId}> your application has been rejected.\n🆔 Application ID: **${applicationId}**\nPlease contact <@&${process.env.IMMIGRATION_ROLE_ID}>`,
          files: [attachment],
        });
      }

      await interaction.message.edit({ components: [] });

      return safeEdit(interaction, {
        content: `❌ Rejected <@${userId}> | 🆔 ${applicationId}`,
        components: [],
      });
    }

    /* ================= WAITLIST ================= */
    if (action === "waitlist") {
      try {
        // remove accepted role if exists
        if (member.roles.cache.has(process.env.ROLE_ID)) {
          await member.roles.remove(process.env.ROLE_ID);
        }

        await member.roles.add(process.env.PENDING_ROLE_ID);
      } catch (err) {
        console.error("❌ Pending role error:", err);

        return safeEdit(interaction, {
          content: "⚠️ Failed to assign pending role.",
          components: interaction.message.components,
        });
      }

      const { buffer } = await generateCard({
        username: member.user.username,
        avatarUrl,
        status: "waitlist",
      });

      const attachment = new AttachmentBuilder(buffer, {
        name: "waitlist.png",
      });

      const waitChannel = await client.channels
        .fetch(process.env.WAITING_CHANNEL_ID)
        .catch(() => null);

      if (waitChannel) {
        await waitChannel.send({
          content: `⏳ <@${userId}> your application is in waiting list.\n🆔 Application ID: **${applicationId}**\nJoin <#${process.env.WAITING_VC_ID}>`,
          files: [attachment],
        });
      }

      // keep buttons
      return safeEdit(interaction, {
        content: `⏳ Waiting List | <@${userId}> | 🆔 ${applicationId}`,
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
