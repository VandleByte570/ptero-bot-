const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ask")
		.setDescription("Ask the AI assistant a question")
		.addStringOption((option) =>
			option
				.setName("prompt")
				.setDescription("Your question for the AI")
				.setRequired(true)
				.setMaxLength(4000)
		),

	async execute(interaction) {
		await interaction.deferReply();

		try {
			if (!process.env.OPENAI_API_KEY) {
				throw new Error("OPENAI_API_KEY is not configured.");
			}

			const prompt = interaction.options.getString("prompt", true);

			const response = await fetch(
				"https://api.openai.com/v1/responses",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
					},
					body: JSON.stringify({
						model: "gpt-4o-mini",
						input: prompt,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				console.error("OpenAI API Error:", data);

				throw new Error(
					data?.error?.message ||
						`OpenAI API returned HTTP ${response.status}`
				);
			}

			let answer = data.output_text;

			if (!answer) {
				throw new Error("The AI returned an empty response.");
			}

			const prefix = `**Question:** ${prompt}\n\n**Answer:**\n`;
			const maxLength = 2000 - prefix.length;

			if (answer.length > maxLength) {
				answer =
					answer.substring(0, Math.max(0, maxLength - 25)) +
					"\n... *(truncated)*";
			}

			await interaction.editReply(prefix + answer);
		} catch (error) {
			console.error("AI Command Error:", error);

			await interaction.editReply(
				"❌ Failed to contact the AI model. Please try again later."
			);
		}
	},
};
