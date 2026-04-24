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
client.once("ready", () => {
  console.log(`🤖 Bot running as ${client.user.tag}`);
});

/* =========================
   🔘 BUTTON HANDLER
========================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  try {
    const [action, userId] = interaction.customId.split("_");

    // 🔍 Fetch member safely
    const member = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "⚠️ User not found in server.",
        ephemeral: true,
      });
    }

    /* ================= ACCEPT ================= */
    if (action === "accept") {

      // ✅ Assign role
      await member.roles.add(process.env.ROLE_ID);

      // 🎉 Send visa message
      const visaChannel = await client.channels.fetch(
        process.env.VISA_CHANNEL_ID
      );

      if (visaChannel) {
        await visaChannel.send(
          `🎉 <@${userId}> your visa has been accepted! Welcome to Maanagaram.`
        );
      }

      // ✅ Update message + disable buttons
      await interaction.update({
        content: `✅ Accepted <@${userId}>`,
        components: [],
      });
    }

    /* ================= REJECT ================= */
    if (action === "reject") {
      await interaction.update({
        content: `❌ Rejected <@${userId}>`,
        components: [],
      });
    }

  } catch (err) {
    console.error("❌ Button Error:", err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "⚠️ Something went wrong.",
        ephemeral: true,
      });
    }
  }
});

/* =========================
   🔐 LOGIN
========================= */
client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = client;