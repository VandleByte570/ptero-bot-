const required = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
};

const numberEnv = (name, fallback) => {
    const value = process.env[name];

    if (value === undefined || value === "") {
        return fallback;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        throw new Error(
            `Environment variable ${name} must be a valid number.`
        );
    }

    return number;
};

const booleanEnv = (name, fallback) => {
    const value = process.env[name];

    if (value === undefined || value === "") {
        return fallback;
    }

    return ["true", "1", "yes", "on"].includes(value.toLowerCase());
};

module.exports = {
    prefix: process.env.PREFIX || "%",

    token: required("DISCORD_TOKEN"),
    owner: required("DISCORD_OWNER_ID"),
    client_id: required("DISCORD_CLIENT_ID"),
    test_guild_id: required("DISCORD_GUILD_ID"),

    pterodactyl: {
        company: process.env.PTERODACTYL_COMPANY || "Pterodactyl",

        domain: required("PTERODACTYL_DOMAIN"),

        apiKey: process.env.PTERODACTYL_API_KEY || "",

        API_ENCRYPTION_KEY: required("PTERODACTYL_ENCRYPTION_KEY"),

        MANAGER_EMBED_UPDATE_INTERVAL: numberEnv(
            "MANAGER_EMBED_UPDATE_INTERVAL",
            5
        ),

        SERVER_MANAGER_TIMEOUT: numberEnv(
            "SERVER_MANAGER_TIMEOUT",
            300
        ),

        SERVER_STATUS_UPDATE_INTERVAL: numberEnv(
            "SERVER_STATUS_UPDATE_INTERVAL",
            30
        ),

        ENABLE_SERVER_STATUS_CONSOLE_LOGS: booleanEnv(
            "ENABLE_SERVER_STATUS_CONSOLE_LOGS",
            false
        ),

        NODE_STATUS_UPDATE_INTERVAL: numberEnv(
            "NODE_STATUS_UPDATE_INTERVAL",
            300
        ),

        EMBED_FOOTER_ICON_URL:
            process.env.EMBED_FOOTER_ICON_URL || "",

        EMBED_FOOTER_TEXT:
            process.env.EMBED_FOOTER_TEXT || "Powered by Pterodactyl",

        ERROR_LOGGING_ENABLED: booleanEnv(
            "ERROR_LOGGING_ENABLED",
            false
        ),

        LOG_HTTP_WARNINGS: booleanEnv(
            "LOG_HTTP_WARNINGS",
            true
        ),
    },
};
