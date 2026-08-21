# =============================================================================
# ROMEO-HYDRA — Build Recipe Inmutable (multi-stage)
# Principio: mínima superficie de ataque, no-root, fail-closed en runtime.
# No expone lógica del Kernel Sigma; solo empaqueta el artefacto instalable.
# Autor: Luis Angel Vazquez Martinez
# =============================================================================

# ---- Stage 1: builder -------------------------------------------------------
FROM python:3.12-alpine AS builder

RUN apk add --no-cache \
    build-base \
    linux-headers \
    && rm -rf /var/cache/apk/*

WORKDIR /build

# Solo dependencias declaradas (numpy). cryptography queda fuera del build base.
COPY pyproject.toml PACKAGE_README.md requirements.txt ./
COPY romeo_hydra/ ./romeo_hydra/
COPY pilot/ ./pilot/
COPY main.py ./

RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir --upgrade pip setuptools wheel \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt \
    && /opt/venv/bin/pip install --no-cache-dir --no-deps .

# ---- Stage 2: runtime mínimo ------------------------------------------------
FROM python:3.12-alpine AS runtime

# Endurecimiento: sin shell interactivo privilegiado, tmp no-exec donde aplique.
RUN apk add --no-cache \
    ca-certificates \
    tini \
    && rm -rf /var/cache/apk/* \
    && addgroup -S romeo && adduser -S -G romeo -H -s /sbin/nologin romeo \
    && mkdir -p /app /data \
    && chown -R romeo:romeo /app /data

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/data

COPY --from=builder /opt/venv /opt/venv
COPY --chown=romeo:romeo main.py /app/main.py
COPY --chown=romeo:romeo pilot/ /app/pilot/
COPY --chown=romeo:romeo scripts/ /app/scripts/

WORKDIR /app
USER romeo

# Health / smoke mínimo (no importa cryptography ni Kernel propietario completo)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import romeo_hydra; print('ok')" || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["python", "main.py"]
