// Augment challenge objects with new optional fields used at runtime
declare module '../challenges/python' {
  interface PythonChallengeMeta {
    strictComparison?: boolean;
    expectedPattern?: string; // regex string (no delimiters) evaluated with 'ms' flags
    skipVerification?: boolean; // existing optional
  }
}
