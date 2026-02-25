import { describe, expect, it } from 'vitest';
import {
  invokeOpenClaw,
  type OpenClawRequestDTO,
} from '../../src/gateway/openclawGateway.ts';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
}

describe('OpenClaw live contract', () => {
  it('returns a response compatible with OpenClawResponseDTO', async () => {
    const baseUrl = getRequiredEnv('OPENCLAW_BASE_URL');
    const endpointPath = process.env.OPENCLAW_ENDPOINT_PATH?.trim() || '/process';

    const request: OpenClawRequestDTO = {
      requestId: `live_contract_${Date.now()}`,
      input: {
        text: 'Return a short answer and at least one action item.',
        type: 'text',
        language: 'en',
      },
      context: {
        objectiveId: 'contract-test',
        objectiveName: 'Live contract validation',
        domain: 'technical',
        urgency: 'medium',
        stakeholders: ['qa'],
        compliance: ['contract'],
      },
      capabilities: {
        streaming: false,
        functionCalling: true,
        multimodal: false,
        longContext: false,
        highAccuracy: true,
      },
      engine: {
        providerId: 'kair0s-local',
        model: 'kair0s:main',
        fallbackProviderIds: [],
      },
    };

    const response = await invokeOpenClaw(request, {
      baseUrl,
      endpointPath,
      timeoutMs: 20_000,
      retries: 0,
      transport: 'http',
    });

    // Contract assertions: if OpenClaw shape drifts, this must fail.
    expect(response).toBeDefined();
    expect(response.answer).toBeDefined();
    expect(typeof response.answer.text).toBe('string');
    expect(response.answer.text.length).toBeGreaterThan(0);
    expect(Array.isArray(response.actions)).toBe(true);
    expect(Array.isArray(response.artifacts)).toBe(true);
    expect(Array.isArray(response.citations)).toBe(true);
  });
});
