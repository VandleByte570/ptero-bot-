const { SlashCommandBuilder } = require('discord.js');

// Optional: restrict command to one channel.
// Leave empty ('') to allow the command everywhere.
const ALLOWED_CHANNEL_ID = '';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the AI assistant a question')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('Your question for the AI')
        .setRequired(true)
        .setMaxLength(4000)
    ),

  async execute(interaction) {
    // Channel restriction
    if (
      ALLOWED_CHANNEL_ID &&
      interaction.channelId !== ALLOWED_CHANNEL_ID
    ) {
      return interaction.reply({
        content: `This command can only be used in <#${ALLOWED_CHANNEL_ID}>.`,
        ephemeral: true
      });
    }

    const prompt = interaction.options.getString('prompt', true);

    // Tell Discord we're processing the request
    await interaction.deferReply();

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured.');
      }

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          input: prompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('OpenAI API Error:', data);

        throw new Error(
          data?.error?.message ||
          `OpenAI API returned HTTP ${response.status}`
        );
      }

      let replyText = data.output_text;

      if (!replyText) {
        throw new Error('OpenAI returned an empty response.');
      }

      // Discord message limit is 2000 characters.
      const questionText = `**Question:** ${prompt}\n\n**Answer:**\n`;

      const availableLength = 2000 - questionText.length;

      if (availableLength <= 50) {
        replyText = replyText.substring(0, 1800) + '...';
      } else if (replyText.length > availableLength) {
        replyText =
          replyText.substring(0, availableLength - 20) +
          '\n... *(truncated)*';
      }

      await interaction.editReply(
        questionText + replyText
      );

    } catch (error) {
      console.error('AI Command Error:', error);

      await interaction.editReply({
        content:
          '❌ An error occurred while contacting the AI model. Please try again later.'
      });
    }
  }
};
