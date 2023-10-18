
import pino, {type Logger as PinoLogger} from 'pino'

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfiguration {
    defaultLogLevel: LogLevel,
    stdout?:boolean,
    file?: {
        debug?:{destination:string},
        info?:{destination:string},
        warn?:{destination:string},
        error?:{destination:string}
    }
}

export interface ILogger {
    debug(...data: unknown[]): void;
    info(...data: unknown[]): void;
    warn(...data: unknown[]): void;
    error(err: Error, info: object | string): void;
    child(context: object): ILogger;
}


export function getPinoTransports(config:LoggerConfiguration) {

    const pinoPretty = config.stdout ?? true ? [{
        level: 'info',
        target: 'pino-pretty',
        options: {}
      }] : [];

    const fileHandlers = Object.entries(config.file ?? {}).map(([logLevel, config]) => ({
        level: logLevel,
          target: 'pino/file',
          options: { destination: config.destination }
    }))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return [...pinoPretty, ...fileHandlers]
}

export class DefaultLogger implements ILogger {
    private logger: PinoLogger;
    private config:LoggerConfiguration;

    children: Map<string, ILogger> = new Map();

    constructor(config:LoggerConfiguration) {
        this.config = config
        // this.logger = pino({name:'LeanJS',
        // level:config.defaultLogLevel,
        // transport: {
        //     target: 'pino-pretty'
        //   }})
        this.logger = pino(pino.transport({
            targets: getPinoTransports(config),
            dedupe:true,
          }));

    }

    child(context:object): ILogger {
        const contextString = JSON.stringify(context);
        if (this.children.has(contextString)) {
            return this.children.get(contextString) as ILogger
        }
        const childLogger = new DefaultLogger(this.config);
        childLogger.logger = this.logger.child(context)
        this.children.set(contextString, childLogger)
        return childLogger
    }

    debug(msg: string, ...args: object[]): void {
        this.logger.debug(msg, ...args)
    }
    info(msg: string, ...args: object[]): void {
        this.logger.info(msg, ...args)
    }
    warn(msg: string, ...args: object[]): void {
        this.logger.warn(msg, ...args);
    }
    error(err: Error, info: object | string): void {
        this.logger.error({err, info});
    }
}
