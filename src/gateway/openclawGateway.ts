/**
 * Kair0s OpenClaw Gateway
 *
 * Runtime gateway for calling OpenClaw over HTTP or Tauri IPC.
 * Includes runtime DTO validation, timeout, retries, and structured logs.
 */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface OpenClawRequestDTO {
  requestId: string;
  input: {
    text: string;
    type: 'text' | 'transcript' | 'command' | 'contextual';
    language?: string;
  };
  context: {
    objectiveId: string;
    objectiveName: string;
    domain?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    stakeholders?: string[];
    compliance?: string[];
    metadata?: Record<string, Json>;
  };
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    multimodal: boolean;
    longContext: boolean;
    highAccuracy: boolean;
  };
  engine: {
    providerId: string;
    model: string;
    fallbackProviderIds: string[];
  };
}

export interface OpenClawResponseDTO {
  answer: {
    text: string;
    provider?: string;
    model?: string;
  };
  actions: Array<{
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    owner?: string;
    dueDate?: string;
  }>;
  artifacts: Array<{
    type: string;
    content: Json;
    mimeType?: string;
  }>;
  citations: Array<{
    title?: string;
    url?: string;
    snippet?: string;
  }>;
  usage?: {
    latencyMs?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    costUsd?: number;
  };
  raw?: unknown;
}

export interface InvokeOpenClawOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  transport?: 'http' | 'ipc';
  baseUrl?: string;
  endpointPath?: string;
}

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY_MS = 250;
const DEFAULT_BASE_URL = 'http://127.0.0.1:18789/api/v1';
const DEFAULT_ENDPOINT_PATH = '/process';

function logStructured(level: 'info' | 'warn' | 'error', event: string, data: Record<string, unknown>): void {
  const payload = {
    service: 'openclawGateway',
    level,
    event,
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (level === 'error') {
    console.error(payload);
  } else if (level === 'warn') {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateRequest(dto: OpenClawRequestDTO): void {
  if (!dto.requestId || !dto.requestId.trim()) {
    throw new Error('OpenClawRequestDTO.requestId is required');
  }
  if (!dto.input?.text || !dto.input.text.trim()) {
    throw new Error('OpenClawRequestDTO.input.text is required');
  }
  if (!dto.context?.objectiveId) {
    throw new Error('OpenClawRequestDTO.context.objectiveId is required');
  }
  if (!dto.engine?.providerId || !dto.engine?.model) {
    throw new Error('OpenClawRequestDTO.engine.providerId and engine.model are required');
  }
}

function normalizeResponseShape(raw: unknown): OpenClawResponseDTO {
  // Accept standard shape directly
  if (isRecord(raw) && isRecord(raw.answer) && typeof raw.answer.text === 'string') {
    return {
      answer: {
        text: raw.answer.text,
        provider: typeof raw.answer.provider === 'string' ? raw.answer.provider : undefined,
        model: typeof raw.answer.model === 'string' ? raw.answer.model : undefined,
      },
      actions: Array.isArray(raw.actions) ? raw.actions as OpenClawResponseDTO['actions'] : [],
      artifacts: Array.isArray(raw.artifacts) ? raw.artifacts as OpenClawResponseDTO['artifacts'] : [],
      citations: Array.isArray(raw.citations) ? raw.citations as OpenClawResponseDTO['citations'] : [],
      usage: isRecord(raw.usage) ? raw.usage as OpenClawResponseDTO['usage'] : undefined,
      raw,
    };
  }

  // Accept simple/generic legacy shape and convert
  if (isRecord(raw) && typeof raw.response === 'string') {
    return {
      answer: {
        text: raw.response,
        provider: typeof raw.provider === 'string' ? raw.provider : undefined,
      },
      actions: [],
      artifacts: [],
      citations: [],
      raw,
    };
  }

  throw new Error('OpenClaw response shape validation failed');
}

async function invokeViaHttp(
  dto: OpenClawRequestDTO,
  options: Required<Pick<InvokeOpenClawOptions, 'timeoutMs' | 'baseUrl' | 'endpointPath'>>
): Promise<OpenClawResponseDTO> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(`${options.baseUrl}${options.endpointPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenClaw HTTP ${response.status}`);
    }

    const json = await response.json();
    return normalizeResponseShape(json);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function invokeViaIpc(dto: OpenClawRequestDTO): Promise<OpenClawResponseDTO> {
  const tauriCore = await import('@tauri-apps/api/core');
  const result = await tauriCore.invoke('openclaw_invoke', { request: dto });
  return normalizeResponseShape(result);
}

export async function invokeOpenClaw(
  request: OpenClawRequestDTO,
  options: InvokeOpenClawOptions = {}
): Promise<OpenClawResponseDTO> {
  validateRequest(request);

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const transport = options.transport ?? 'http';
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const endpointPath = options.endpointPath ?? DEFAULT_ENDPOINT_PATH;

  let lastError: unknown = null;
  const startedAt = Date.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      logStructured('info', 'request_attempt', {
        requestId: request.requestId,
        attempt,
        transport,
      });

      const response = transport === 'ipc'
        ? await invokeViaIpc(request)
        : await invokeViaHttp(request, { timeoutMs, baseUrl, endpointPath });

      logStructured('info', 'request_success', {
        requestId: request.requestId,
        attempt,
        latencyMs: Date.now() - startedAt,
      });

      return response;
    } catch (error) {
      lastError = error;
      logStructured('warn', 'request_failure', {
        requestId: request.requestId,
        attempt,
        message: error instanceof Error ? error.message : String(error),
      });

      if (attempt < retries) {
        await sleep(retryDelayMs);
      }
    }
  }

  logStructured('error', 'request_exhausted', {
    requestId: request.requestId,
    retries,
    message: lastError instanceof Error ? lastError.message : String(lastError),
  });
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
