module.exports = {
  apps: [
    {
      name: "ospain2",
      cwd: "../OSPAiN2-hub",
      script: "npm",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
        args: "run dev",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "../logs/ospain2-error.log",
      out_file: "../logs/ospain2-out.log",
      merge_logs: true,
    },
  ],
};
