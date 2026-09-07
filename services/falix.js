const BASE_URL = "https://client.falixnodes.net/api/v2";

function getConfig() {
	const apiKey = process.env.FALIX_API_KEY;
	const serverId = process.env.FALIX_SERVER_ID;

	if (!apiKey) {
		throw new Error("FALIX_API_KEY is not configured.");
	}

	if (!serverId) {
		throw new Error("FALIX_SERVER_ID is not configured.");
	}

	return { apiKey, serverId };
}

async function falixRequest(path, options = {}) {
	const { apiKey } = getConfig();

	const response = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
			...(options.headers || {}),
		},
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		const message =
			data?.error?.message ||
			data?.error?.code ||
			`Falix API HTTP ${response.status}`;

		const error = new Error(message);
		error.status = response.status;
		error.data = data;

		throw error;
	}

	return data;
}

async function getServer() {
	const { serverId } = getConfig();

	return falixRequest(`/servers/${encodeURIComponent(serverId)}`);
}

async function getServerStatus() {
	const { serverId } = getConfig();

	return falixRequest(
		`/servers/${encodeURIComponent(serverId)}/status`
	);
}

async function powerServer(action) {
	const { serverId } = getConfig();

	const allowed = ["start", "stop", "restart"];

	if (!allowed.includes(action)) {
		throw new Error(`Unsupported power action: ${action}`);
	}

	return falixRequest(
		`/servers/${encodeURIComponent(serverId)}/power`,
		{
			method: "POST",
			body: JSON.stringify({
				signal: action,
			}),
			headers: {
				"Idempotency-Key":
					`discord-${serverId}-${action}-${Date.now()}`,
			},
		}
	);
}

module.exports = {
	getServer,
	getServerStatus,
	powerServer,
};
