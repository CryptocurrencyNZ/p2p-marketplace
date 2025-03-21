const getEnvironmentVariable = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

export const env = {
  NODE_ENV: getEnvironmentVariable("NODE_ENV", "development"),
  DATABASE_URL: getEnvironmentVariable("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/chat_app"),
  JWT_SECRET: getEnvironmentVariable("JWT_SECRET", "your-secret-key-change-in-production"),
  MESSAGE_EXPIRATION_HOURS: parseInt(getEnvironmentVariable("MESSAGE_EXPIRATION_HOURS", "24")),
}; 