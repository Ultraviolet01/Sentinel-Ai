/**
 * Sentinel AI: Error Infrastructure
 * Maps technical failures to high-fidelity, operative user messages.
 */

export enum SentinelErrorCode {
  NO_TOKEN_FOUND = "NO_TOKEN_FOUND",
  ACCESS_RESTRICTED = "ACCESS_RESTRICTED",
  SYNC_TIMEOUT = "SYNC_TIMEOUT",
  API_FAILURE = "API_FAILURE",
  VOICE_LOST = "VOICE_LOST"
}

export class SentinelError extends Error {
  public code: SentinelErrorCode;
  public userMessage: string;

  constructor(code: SentinelErrorCode, technicalMessage?: string) {
    super(technicalMessage || code);
    this.name = "SentinelError";
    this.code = code;
    this.userMessage = this.mapCodeToMessage(code);
  }

  private mapCodeToMessage(code: SentinelErrorCode): string {
    switch (code) {
      case SentinelErrorCode.NO_TOKEN_FOUND:
        return "Couldn’t find a token on this page.";
      case SentinelErrorCode.ACCESS_RESTRICTED:
        return "Sentinel access restricted on this page.";
      case SentinelErrorCode.SYNC_TIMEOUT:
        return "Operative timeout. Analysis is taking too long.";
      case SentinelErrorCode.API_FAILURE:
        return "Analysis failed. Try scanning again.";
      case SentinelErrorCode.VOICE_LOST:
        return "No playable voice response was returned.";
      default:
        return "An unexpected operative error occurred.";
    }
  }
}
