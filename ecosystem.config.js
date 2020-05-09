module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'Random League Server',
      script: './dist/start.js',
      source_map_support: true,
      exec_mode: 'cluster',
      instances: 'max'
    }
  ]
};