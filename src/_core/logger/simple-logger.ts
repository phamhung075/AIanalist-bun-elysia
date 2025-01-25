import * as path from "path";
import * as fs from "fs";

export class SimpleLogger {
    private logFile: string;
    private fsModule: typeof fs;

    constructor(fsModule = fs) {
        this.fsModule = fsModule;
        const logDir = path.join(__dirname, '../../../logs');
        if (!this.fsModule.existsSync(logDir)) {
            this.fsModule.mkdirSync(logDir, { recursive: true });
        }
        this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    }

    private log(level: string, message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        let metaStr = '';
        
        if (meta) {
            if (meta.error && meta.error.includes('\n')) {
                metaStr = meta.error.split('\n').map((line: any) => `    ${line}`).join('\n');
            } else {
                metaStr = JSON.stringify(meta, null, 2);
            }
        }
        
        const logMessage = `${timestamp} [${level}] ${message}\n${metaStr ? metaStr + '\n' : ''}`;
        console.log(logMessage.trim());
        this.fsModule.appendFileSync(this.logFile, logMessage);
    }
    
    error(message: string, error: Error): void {
        this.log('ERROR', message, {
            error: `${error.message}\n${error.stack}`
        });
    }

    info(message: string, meta?: any): void {
        this.log('INFO', message, meta);
    }
    
    warn(message: string, meta?: any): void {
        this.log('WARN', message, meta);
    }
    
    debug(message: string, meta?: any): void {
        this.log('DEBUG', message, meta);
    }
}