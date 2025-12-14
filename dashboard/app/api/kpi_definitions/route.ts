import { NextResponse } from 'next/server';
import { KPI_DEFINITIONS, KPI_CONTRACT_VERSION } from '../_lib/kpi_definitions';

/**
 * KPI Definitions Endpoint
 * Returns metadata about all KPIs for tooltips, documentation, and contract validation
 * No secrets, no Freshdesk calls - pure contract info
 */
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    kpi_contract_version: KPI_CONTRACT_VERSION,
    updated_at: new Date().toISOString(),
    definitions: KPI_DEFINITIONS,
  });
}
