declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAIL_HOST: string
      MAIL_PORT: string
      MAIL_TLS: 'true' | 'false'
      MAIL_USERNAME: string
      MAIL_PASSWORD: string

      ENVOY_EMAIL: string,
      ENVOY_PASSWORD: string

      APP_SECRET: string
    }
  }
}

export {}
