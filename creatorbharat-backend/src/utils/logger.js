import config from '../config/index.js';

const isProduction = config.app.isProduction;

export const logger = {
  info(message, meta = {}) {
    log('INFO', message, meta);
  },
  warn(message, meta = {}) {
    log('WARN', message, meta);
  },
  error(message, err = null, meta = {}) {
    const errorMeta = err ? {
      errorMessage: err.message,
      errorStack: err.stack,
      ...meta
    } : meta;
    log('ERROR', message, errorMeta);
  }
};

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  if (isProduction) {
    // In production, output structured JSON for cloud log collectors (Datadog, Render, etc.)
    console.log(JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    }));
  } else {
    // In local development, output readable colored logs
    const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
    const reset = '\x1b[0m';
    const metaString = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
    console.log(`${color}[${timestamp}] [${level}]${reset} ${message}${metaString}`);
  }
}
