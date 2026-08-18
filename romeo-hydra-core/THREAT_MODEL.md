# THREAT MODEL — ROMEO-HYDRA V3.0-RC1 (TRL-6/7 target)

## 1. Asset
- Integrity and non-repudiation of every action that the system allows.
- The receipt is the only proof that an action was admissible.

## 2. Trust Boundary
- Everything outside `ROOT` is untrusted.
- Every signal is untrusted until it survives parse → capability check → ROOT confinement.
- The ledger is append-only and local. No remote trust.

## 3. Adversary Goals
- Execute a verb not in the closed set.
- Escalate privileges (use a verb outside the role’s capability set).
- Escape ROOT (path traversal, absolute paths).
- Break the receipt chain (replay, reorder, or forge a receipt).
- Cause the system to open the gate on ledger-write failure.

## 4. Mitigations already present
- Closed verb set (no open verbs).
- Explicit DFA with fail-closed illegal transitions.
- Role → capability matrix (least privilege).
- ROOT confinement on any entity that looks like a path.
- Chained ledger (seq + prev_hash).
- Fail-closed on ledger write errors (gate stays closed).

## 5. Residual risks (to close for TRL-7)
- No cryptographic signature of receipts (only SHA-256 hash chain).
- No multi-party attestation.
- No formal proof of the DFA (model checking still pending).
- Single local ledger file (availability risk).

## 6. Acceptance criteria for TRL-7
- Independent threat-model review.
- Property-based / fuzz tests of the parser.
- Formal verification or exhaustive state exploration of the DFA.
- At least one external audit of the ledger chain integrity.
