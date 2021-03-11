export const appConfig = {
    // Base
    isProduction: process.env.NODE_ENV === "production",
    // API
    apiVersion: process.env.API_VERSION || "1.0",
    // Server
    host: process.env.HOST || "0.0.0.0",
    port: parseInt(process.env.PORT) || 3000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 10000,
    // gRPC
    clientId: process.env.CLIENT_ID || "",
};
