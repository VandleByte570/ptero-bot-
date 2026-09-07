const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ask")
		.setDescription("Ask the AI assistant a question")
		.addStringOption(option =>
			option
				.setName("prompt")
				.setDescription("Your question")
				.setRequired(true)
				.setMaxLength(4000)
		),

	async execute(interaction) {
		await interaction.deferReply();

		try {
			const apiKey = process.env.OPENAI_API_KEY;

			if (!apiKey) {
				throw new Error("OPENAI_API_KEY is not configured.");
			}

			const prompt = interaction.options.getString("prompt", true);

			const response = await fetch(
				"https://api.openai.com/v1/responses",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify({
						model: "gpt-4o-mini",
						input: prompt,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				console.error("OpenAI API error:", data);
				throw new Error(
					data?.error?.message ||
					`OpenAI HTTP ${response.status}`
				);
			}

			const answer = data.output_text;

			if (!answer) {
				throw new Error("Empty AI response.");
			}

			const prefix = `**Question:** ${prompt}\n\n**Answer:**\n`;
			const max = 2000 - prefix.length;

			const finalAnswer =
				answer.length > max
					? answer.slice(0, Math.max(0, max - 25)) +
					  "\n... *(truncated)*"
					: answer;

			await interaction.editReply(prefix + finalAnswer);

		} catch (error) {
			console.error("Ask command error:", error);

			await interaction.editReply(
				"❌ AI request failed. Please try again."
			);
		}
	},
};
