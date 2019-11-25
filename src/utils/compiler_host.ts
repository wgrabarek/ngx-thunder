import * as ts from 'typescript';

export class TestCompilerHost implements ts.CompilerHost {
  fallbackHost: ts.CompilerHost;
  compiled: string;
  source: ts.SourceFile;

  constructor(private fileName: string, private code: string) {
    this.fallbackHost = ts.createCompilerHost(ts.getDefaultCompilerOptions(), true);
    (this as ts.CompilerHost).getDirectories = this.fallbackHost?.getDirectories?.bind(this.fallbackHost);
    (this as ts.CompilerHost).directoryExists = this.fallbackHost?.directoryExists?.bind(this.fallbackHost);
    this.source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest);
  }
  getSourceFile(
    fileName: string,
    languageVersion: ts.ScriptTarget,
    onError?: ((message: string) => void) | undefined,
    shouldCreateNewSourceFile?: boolean | undefined
  ): ts.SourceFile | undefined {
    return this.fileName === fileName
      ? this.source
      : this.fallbackHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  }
  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.fallbackHost.getDefaultLibFileName(options);
  }
  writeFile = (_, data) => {
    this.compiled = data;
  };
  getCurrentDirectory(): string {
    return this.fallbackHost.getCurrentDirectory();
  }
  getCanonicalFileName(fileName: string): string {
    return this.fallbackHost.getCanonicalFileName(fileName);
  }
  useCaseSensitiveFileNames(): boolean {
    return this.fallbackHost.useCaseSensitiveFileNames();
  }
  getNewLine(): string {
    return this.fallbackHost.getNewLine();
  }
  readFile(fileName: string): string | undefined {
    return fileName === this.fileName ? this.code : this.fallbackHost.readFile(fileName);
  }
  fileExists(fileName: string): boolean {
    return this.fileName === fileName || this.fallbackHost.fileExists(fileName);
  }
  getCompiled() {
    return this.compiled;
  }
}

export const compile = (
  code: string,
  transform: (t) => ts.TransformerFactory<ts.SourceFile>
): { code: string | undefined; diagnostics: string } => {
  const testFileName: string = '/project/src/test-file.ts';
  const host = new TestCompilerHost(testFileName, code);
  const tslib = require.resolve(`typescript/lib/lib.es2015.d.ts`);
  const program: ts.Program = ts.createProgram(
    [tslib, testFileName],
    {
      ...ts.getDefaultCompilerOptions(),
      target: ts.ScriptTarget.ES2016,
      lib: ['es2015'],
      skipLibCheck: true,
      importHelpers: true,
    },
    host
  );
  const getTypeChecker = () => program.getTypeChecker();

  program.emit(undefined, undefined, undefined, undefined, {
    before: [transform(getTypeChecker)],
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);

  return {
    code: host.getCompiled(),
    diagnostics: diagnostics.map(d => d.messageText).join('\r\n'),
  };
};
