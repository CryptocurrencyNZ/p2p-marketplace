declare module 'better-sqlite3' {
  interface Database {
    prepare: (sql: string) => Statement;
    transaction: (fn: Function) => Function;
    pragma: (pragma: string, mode?: any) => any;
    checkpoint: (mode?: string) => void;
    function: (name: string, fn: Function) => void;
    aggregate: (name: string, options: any) => void;
    loadExtension: (path: string) => void;
    exec: (sql: string) => void;
    close: () => void;
    defaultSafeIntegers: (safe?: boolean) => Database;
    backup: (filename: string, options?: any) => Promise<void>;
  }

  interface Statement {
    run: (...params: any[]) => RunResult;
    get: <T = any>(...params: any[]) => T;
    all: <T = any>(...params: any[]) => T[];
    iterate: <T = any>(...params: any[]) => IterableIterator<T>;
    pluck: (toggleState?: boolean) => Statement;
    expand: (toggleState?: boolean) => Statement;
    raw: (toggleState?: boolean) => Statement;
    bind: (...params: any[]) => Statement;
    columns: () => ColumnDefinition[];
    safeIntegers: (toggleState?: boolean) => Statement;
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  interface ColumnDefinition {
    name: string;
    column: string | null;
    table: string | null;
    database: string | null;
    type: string | null;
  }

  export default function(filename: string, options?: {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: Function;
  }): Database;
} 