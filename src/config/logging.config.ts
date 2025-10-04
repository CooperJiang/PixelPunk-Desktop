export type LogLevel = "off" | "error" | "warn" | "info" | "debug" | "trace";

export interface LoggerConfig {
  level: LogLevel; // minimum level to log
  consoleInDev: boolean; // whether to mirror to console in dev
}

function parseLevel(str?: string | boolean | null): LogLevel {
  if (!str) return import.meta.env.DEV ? "debug" : "warn";
  const s = String(str).toLowerCase();
  if (["off", "error", "warn", "info", "debug", "trace"].includes(s))
    return s as LogLevel;
  return import.meta.env.DEV ? "debug" : "warn";
}

export const loggerConfig: LoggerConfig = {
  level: parseLevel(import.meta.env.VITE_LOG_LEVEL as any),
  consoleInDev:
    String(import.meta.env.VITE_LOG_CONSOLE_DEV || "true") === "true",
};
