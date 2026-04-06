import { AuditRequest, AuditResponse } from './types';
import { SentinelError, SentinelErrorCode } from './errors';

/**
 * Sentinel AI: Operative API Client
 * Orchestrates high-fidelity communication with the intelligence backend.
 */
class SentinelApiClient {
  private static instance: SentinelApiClient;
  private readonly baseUrl: string = "http://localhost:3000/api/audit";
  private readonly timeout: number = 20000; // 20s Operative Guard

  private constructor() {}

  public static getInstance(): SentinelApiClient {
    if (!SentinelApiClient.instance) {
      SentinelApiClient.instance = new SentinelApiClient();
    }
    return SentinelApiClient.instance;
  }

  /**
   * Dispatches a high-density audit request.
   */
  public async analyzeToken(request: AuditRequest): Promise<AuditResponse> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(id);

      if (!response.ok) {
        throw new SentinelError(SentinelErrorCode.API_FAILURE, `Sentinel_Sync_Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validation Check
      if (!data.success) {
        throw new SentinelError(SentinelErrorCode.API_FAILURE, data.error);
      }

      const auditData = data.data;
      if (!auditData?.result) {
        throw new SentinelError(SentinelErrorCode.API_FAILURE, "Malformed audit data received.");
      }

      return {
        success: true,
        score: auditData.result.scores?.risk ?? 0,
        riskLevel: auditData.result.finalVerdict === "Promising" ? "Low" : "High",
        confidence: auditData.result.confidenceLevel ?? 0,
        shortSummary: auditData.result.summary || "Awaiting diagnosis...",
        spokenSummary: auditData.result.summary || "Awaiting diagnosis...",
        redFlags: auditData.result.topRedFlags || [],
        positives: auditData.result.topPositiveSignals || [],
        fullReportUrl: `http://localhost:3000/scan/${auditData.metadata.address}`,
        audioBase64: auditData.audioBase64
      };
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new SentinelError(SentinelErrorCode.SYNC_TIMEOUT, "The audit trace timed out.");
      }
      if (err instanceof SentinelError) throw err;
      throw new SentinelError(SentinelErrorCode.API_FAILURE, err.message);
    }
  }
}

export const apiClient = SentinelApiClient.getInstance();
