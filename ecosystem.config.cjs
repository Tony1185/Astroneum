/**
 * PM2 Ecosystem Config — Astroneum Demo
 *
 * Manages the astroneum-demo Next.js process (library showcase app).
 * Served at /astroneum via nginx reverse proxy to 127.0.0.1:3002.
 *
 * Usage:
 *   pm2 start ecosystem.config.js        # start
 *   pm2 save                             # persist across reboots
 *   pm2 logs                             # tail all logs
 */

module.exports = {
  apps: [
    {
      name: "astroneum-demo",
      script: "pnpm",
      args: "--filter astroneum-demo-next start",
      cwd: "/opt/astroneum",
      interpreter: "node",

      env: {
        NODE_ENV: "production",
        NEXT_PUBLIC_BASE_PATH: "/astroneum",
        NODE_OPTIONS: "--max-old-space-size=256",
        TZ: "Asia/Bangkok",
      },

      // Restart policy
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 4000,

      // Logging
      out_file: "/home/deploy/.pm2/logs/astroneum-demo-out.log",
      error_file: "/home/deploy/.pm2/logs/astroneum-demo-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      max_memory_restart: "512M",
    },
  ],
};
