export class ErrorHandler {
  onError(e: unknown) {
    if (e instanceof Error) {
      console.error(`Error: ${e.message}`);
    }
  }
}
