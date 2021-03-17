export const appConfig = {
    // API
    apiVersion: process.env.API_VERSION || "1.0",
    // Server
    port: parseInt(process.env.PORT) || 3000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 10000,
};
