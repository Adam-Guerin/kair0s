# ADR-0001: Secure Artifact Storage Baseline (SQLite + Encryption-at-Rest)

Status: Accepted  
Date: 2026-02-25

## Context
- Kair0s stores sensitive operational artifacts (sessions, summaries, actions, KPI metadata).
- Previous persistence path was mostly TODO/no-op, with no at-rest encryption baseline.
- We need an early, explicit storage design before scaling integrations.

## Decision
- Standardize persistence through a `SecureStorageAdapter`.
- Baseline provider is `sqlite` with encrypted storage envelopes.
- Keep schema and envelope stable now, even if physical SQLite writes are still stubbed.

## Envelope Contract
- `id`: business object id
- `entityType`: `session | artifact | kpi`
- `encrypted`: boolean
- `payload`: encrypted or plaintext serialized JSON
- `iv`, `tag`: encryption metadata when enabled
- `createdAt`, `updatedAt`: timestamps

## Security Baseline
- Encryption-at-rest is enabled by default in `ArtifactManager` config.
- Key strategy (target): app-generated DEK protected by OS keychain-backed KEK.
- Current step: in-process secure encryption path through the storage adapter.

## Consequences
- Positive:
  - Centralized persistence contract.
  - Future SQLite implementation can be swapped in without changing domain services.
  - Early protection path for stored artifacts.
- Trade-off:
  - Current adapter is a stubbed backend and must be replaced with physical SQLite tables.

## Next Steps
1. Implement real SQLite table persistence behind `SecureStorageAdapter`.
2. Use Tauri keychain/secure enclave for key material lifecycle.
3. Add migration and key-rotation commands.
4. Add integration tests for envelope compatibility and decrypt/read cycle.
