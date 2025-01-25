import { config } from "@config/dotenv.config";
import { serverTiming } from "@elysiajs/server-timing";
import { blue, green, yellow } from "colorette";
import { Elysia } from "elysia";
import * as path from "path";
import { API_CONFIG } from "../config/api-config";
import { testFirestoreAccess } from "../database/firebase-admin-sdk";
import { checkSystemOverload } from "../helper/check-system-overload/check-system-overload";
import { HttpStatusCode } from "../helper/http-status/common/HttpStatusCode";
import { SimpleLogger } from "../logger/simple-logger";
import { errorHandler } from "../middleware/errorHandler";
import { displayRequest } from "../middleware/displayRequest.middleware";
import router from "@/modules";

const env = config.env;
const pathToEnvFile = path.resolve(
  __dirname,
  `../../../../environment/.env.${env}`
);
const envFile = path.resolve(pathToEnvFile);

console.log(green(`Loading environment from ${blue(envFile)}`));
console.log(
  green(
    `All environment variables are ${yellow(
      process.env.TEST_VAR || "N/A"
    )} on mode ${yellow(process.env.NODE_ENV || "N/A")}`
  )
);

export class AppService {
  private static instance: AppService;
  public app!: Elysia;
  private logger: SimpleLogger = new SimpleLogger();
  private port: number = Number(process.env.PORT) || 3000;

  constructor() {
    if (AppService.instance) {
      return AppService.instance;
    }
    this.logger = new SimpleLogger();
    const requestTimes = new Map<string, number>();

    this.app = new Elysia()
      .use(serverTiming())
      .onRequest(({ request }) => {
        const requestId = crypto.randomUUID();
        request.headers.set("x-request-id", requestId);
        requestTimes.set(requestId, Date.now());
        displayRequest(request, requestTimes);
      })
      .onError(({ code, error, request }) => {
        const finalError =
          error instanceof Error ? error : new Error(String(error));
        const status =
          code === "NOT_FOUND"
            ? HttpStatusCode.NOT_FOUND
            : HttpStatusCode.INTERNAL_SERVER_ERROR;
        const requestId = request.headers.get("x-request-id");
        const startTime = requestId ? requestTimes.get(requestId) : undefined;
        if (requestId) requestTimes.delete(requestId);
        return errorHandler({ ...finalError, status }, startTime);
      });

    AppService.instance = this;
  }

  public static getInstance(): AppService {
    if (!AppService.instance) {
      new AppService();
    }
    return AppService.instance;
  }

  private setupSecurity() {
    const origins =
      env === "development"
        ? [...API_CONFIG.CORS.ORIGINS.DEVELOPMENT]
        : [...API_CONFIG.CORS.ORIGINS.PRODUCTION];

    this.app.derive(() => {
      return {
        beforeHandle({
          request,
          set,
        }: {
          request: Request;
          set: { headers: Record<string, string> };
        }) {
          // Basic security headers
          set.headers["X-Content-Type-Options"] = "nosniff";
          set.headers["X-Frame-Options"] = "DENY";
          set.headers["X-XSS-Protection"] = "1; mode=block";

          // CORS
          const origin = request.headers.get("origin");
          if (origin && (origins as string[]).includes(origin)) {
            set.headers["Access-Control-Allow-Origin"] = origin;
            set.headers["Access-Control-Allow-Methods"] =
              "GET,POST,PUT,DELETE,OPTIONS";
            set.headers["Access-Control-Allow-Headers"] = "Content-Type";
          }
        },
      };
    });

    console.log(`✅ Security configured for ${env} environment.`);
  }

  private async init(): Promise<void> {
    this.setupSecurity();
    await router(this.app);
    // Not found handler
    this.app.get("*", () => {
      throw new Error("Route not found");
    });
  }

  private setupGlobalErrorHandlers(): void {
    process.on("uncaughtException", (error) => {
      this.logger.error("Uncaught Exception", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason: unknown) => {
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      this.logger.error("Unhandled Rejection", error);
    });
  }

  async listen(): Promise<void> {
    try {
      await this.init();
      await testFirestoreAccess();
      this.setupGlobalErrorHandlers();

      await this.app.listen(this.port);
      this.logger.info(`Server started on port ${this.port} in ${env} mode`);

      if (config.env === "production") {
        checkSystemOverload();
      }
    } catch (error) {
      this.logger.error("Failed to start server", error as Error);
      throw error;
    }
  }
}

const appService = AppService.getInstance();
const app = appService.app;

export { app, appService };
