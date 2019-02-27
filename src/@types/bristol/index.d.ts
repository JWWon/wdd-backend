interface LogError {
  message?: string;
  reason?: any;
  stack?: any;
}

interface LogData {
  code?: number;
  id?: string;
  path?: string;
  error?: LogError;
  data?: any;
  scope?: string;
}

declare module 'bristol' {
  export function addTarget(target: any, opts?: any): any;
  export function withFormatter(formatter: string): any;
  export function withLowestSeverity(severity: string): any;
  export function info(message: string, data?: LogData): any;
  export function warn(message: string, data?: LogData): any;
  export function error(message: string, data?: LogData): any;
  export function debug(message: string, data?: LogData): any;
}
