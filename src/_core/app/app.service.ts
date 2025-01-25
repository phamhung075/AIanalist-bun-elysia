import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { config } from "@config/dotenv.config"
import { blue, green, yellow } from "colorette"
import * as path from "path"
import { SimpleLogger } from "../logger/simple-logger"
import { testFirestoreAccess } from '../database/firebase-admin-sdk'
import { checkSystemOverload } from '../helper/check-system-overload/check-system-overload'
import { API_CONFIG } from '../helper/http-status/common/api-config'
import { serverTiming } from '@elysiajs/server-timing'

const env = config.env
const pathToEnvFile = path.resolve(__dirname, `../../../../environment/.env.${env}`)
const envFile = path.resolve(pathToEnvFile)

console.log(green(`Loading environment from ${blue(envFile)}`))
console.log(
  green(
    `All environment variables are ${yellow(
      process.env.TEST_VAR || "N/A"
    )} on mode ${yellow(process.env.NODE_ENV || "N/A")}`
  )
)

export class AppService {
  private static instance: AppService
  readonly app!: Elysia
  private logger: SimpleLogger = new SimpleLogger()
  private port: number = Number(process.env.PORT) || 3000

  constructor() {
    if (AppService.instance) {
      return AppService.instance
    }
    this.logger = new SimpleLogger()
    this.app = new Elysia()
    AppService.instance = this
  }

  public static getInstance(): AppService {
    if (!AppService.instance) {
      new AppService()
    }
    return AppService.instance
  }

  private setupSecurity() {
    const origins = env === "development" 
      ? [...API_CONFIG.CORS.ORIGINS.DEVELOPMENT]
      : [...API_CONFIG.CORS.ORIGINS.PRODUCTION]

    this.app.derive(() => {
      return {
        beforeHandle({ request, set }: { request: Request; set: { headers: Record<string, string> } }) {
          // Basic security headers
          set.headers['X-Content-Type-Options'] = 'nosniff'
          set.headers['X-Frame-Options'] = 'DENY'
          set.headers['X-XSS-Protection'] = '1; mode=block'
          
          // CORS
          const origin = request.headers.get('origin')
          if (origin && (origins as string[]).includes(origin)) {
            set.headers['Access-Control-Allow-Origin'] = origin
            set.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
            set.headers['Access-Control-Allow-Headers'] = 'Content-Type'
          }
        }
      }
    })
    
    console.log(`✅ Security configured for ${env} environment.`)
  }

  private async init(): Promise<void> {
    this.setupSecurity()

    // Error handling
    this.app.onError(({ code, error }) => {
      const err = error instanceof Error ? error : new Error('Unknown error')
      this.logger.error(`Error occurred: ${code}`, err)
      return {
        success: false,
        message: err.message || 'Internal Server Error',
        status: code === 'NOT_FOUND' ? 404 : 500,
        errors: (err as any).errors || []
      }
    })

    // Not found handler
    this.app.get('*', () => {
      throw new Error('Route not found')
    })
  }

  private setupGlobalErrorHandlers(): void {
    process.on("uncaughtException", (error) => {
      this.logger.error("Uncaught Exception", error)
      process.exit(1)
    })

    process.on("unhandledRejection", (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      this.logger.error("Unhandled Rejection", error)
    })
  }

  async listen(): Promise<void> {
    try {
      await this.init()
      await testFirestoreAccess()

      this.setupGlobalErrorHandlers()
      
      await this.app.listen(this.port)
      this.logger.info(`Server started on port ${this.port} in ${env} mode`)

      if (config.env === "production") {
        checkSystemOverload()
      }
    } catch (error) {
      this.logger.error("Failed to start server", error as Error)
      throw error
    }
  }
}

const appService = AppService.getInstance()
const app = appService.app

export { app, appService }