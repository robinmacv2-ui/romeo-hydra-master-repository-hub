# Supply Chain Notes — Build Recipe Inmutable

## Artefactos introducidos

| Artefacto | Propósito |
|-----------|-----------|
| `Dockerfile` | Multi-stage: builder → runtime Alpine, user `romeo` no-root, tini, healthcheck mínimo |
| `.dockerignore` | Excluye bitácoras, secretos, media pesada, salidas de pilotos |
| `.github/workflows/reproducible-build.yml` | Freeze + SHA-256 de deps, build wheel, smoke de pilotos, fail-closed anti-CNBV, Docker build, firma Sigstore en tags |

## Superficie de ataque reducida

- Imagen final sin root.
- Sin `cryptography` en el camino base (compatible con política Termux).
- Smoke exige presencia de `folio_note` que niega folio CNBV.
- Firma keyless (OIDC) solo en tags `v*` — no secretos de CI en el repo.

## Política STRICT_DEPS

Si se compromete `security_audit/deps.manifest.sha256` y se exporta `STRICT_DEPS=1` en el workflow, cualquier drift del freeze falla el job (circuito abierto).

## Lo que aún no se afirma

- Reproducibilidad bit-a-bit del wheel entre runners (SOURCE_DATE_EPOCH ayuda, no garantiza).
- Certificación FIPS / SBOM formal (se puede añadir CycloneDX en un incremento posterior).
- Que el contenedor ejecute el Kernel Sigma propietario completo — solo el paquete instalable + pilotos.

---

Luis Angel Vazquez Martinez · 2026
