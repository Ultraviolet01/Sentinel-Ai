import { redirect } from 'next/navigation';

/**
 * Sentinel AI: Scan Index Route
 * Catch-all for when a user triggers a scan without a contract address.
 * Standardizes behavior by redirecting back to the Command Center.
 */
export default function ScanIndex() {
  redirect('/');
}
