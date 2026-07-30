import pc from 'picocolors';

export interface LoggerOptions {
    quiet?: boolean;
    verbose?: boolean;
}

export class Logger {
    private quiet: boolean;
    private verbose: boolean;

    constructor(options: LoggerOptions = {}) {
        this.quiet = options.quiet ?? false;
        this.verbose = options.verbose ?? false;
    }

    log(message: string) {
        if (!this.quiet) {
            console.log(message);
        }
    }

    info(message: string) {
        if (!this.quiet) {
            console.info(pc.cyan(message));
        }
    }

    success(message: string) {
        if (!this.quiet) {
            console.log(pc.green(`✔ ${message}`));
        }
    }

    warn(message: string) {
        if (!this.quiet) {
            console.warn(pc.yellow(`⚠ ${message}`));
        }
    }

    error(message: string | Error) {
        const msg = message instanceof Error ? message.message : message;
        console.error(pc.red(`✖ ${msg}`));
    }

    debug(message: string) {
        if (this.verbose && !this.quiet) {
            console.log(pc.gray(`  ${message}`));
        }
    }

    setOptions(options: LoggerOptions) {
        if (options.quiet !== undefined) this.quiet = options.quiet;
        if (options.verbose !== undefined) this.verbose = options.verbose;
    }
}

export const logger = new Logger();
