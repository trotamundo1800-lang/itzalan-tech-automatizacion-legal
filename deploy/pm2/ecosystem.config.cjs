module.exports = {
  apps: [
    {
      name: 'itzalan-api',
      cwd: '/var/www/itzalan',
      script: 'node',
      args: 'apps/api/dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_restarts: 10,
      restart_delay: 2000,
      out_file: '/var/log/itzalan/api.out.log',
      error_file: '/var/log/itzalan/api.err.log',
      merge_logs: true,
    },
    {
      name: 'itzalan-web',
      cwd: '/var/www/itzalan/apps/web',
      script: '/var/www/itzalan/node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 0.0.0.0',
      env: {
        NODE_ENV: 'production',
      },
      max_restarts: 10,
      restart_delay: 2000,
      out_file: '/var/log/itzalan/web.out.log',
      error_file: '/var/log/itzalan/web.err.log',
      merge_logs: true,
    },
  ],
};
