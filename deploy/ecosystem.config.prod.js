module.exports = {
  apps: [
    {
      // API Server
      name: 'itzalan-api',
      script: './apps/api/dist/main.js',
      cwd: '/home/itzalan/app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/home/itzalan/app/logs/api-error.log',
      out_file: '/home/itzalan/app/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
    },
    {
      // Next.js Web Server
      name: 'itzalan-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/itzalan/app/apps/web',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/home/itzalan/app/logs/web-error.log',
      out_file: '/home/itzalan/app/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
    },
  ],

  // PM2+ Features (optional, requires PM2 Plus subscription)
  // deploy: {
  //   production: {
  //     user: 'itzalan',
  //     host: 'your-vps-ip',
  //     ref: 'origin/main',
  //     repo: 'git@github.com:yourorg/itzalan-tech.git',
  //     path: '/home/itzalan/app',
  //     'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.prod.js --env production',
  //   },
  // },
};
