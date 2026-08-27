# Cómo se arma un recibo (borrador)

## Idea simple
Cada decisión importante deja un recibo: qué entró, qué regla se usó,
qué se decidió, y un sello que permite detectar cambios posteriores.

## Datos mínimos que debería llevar
- identificador del evento
- resumen de la entrada (hash)
- regla o política (nombre y versión)
- decisión (permitir / denegar / retener)
- si se intentó ejecutar algo y qué pasó
- enlace al recibo anterior (cadena)
- sello del recibo actual

## Dos cosas distintas (no mezclar)
1) Decisión de la regla: por ejemplo "denegar"
2) Efecto real: por ejemplo "se bloqueó" o "no aplica"

## Qué hace el módulo crypto actual
El sobre (envelope) guarda de forma ordenada:
versión, id, nonce, ciphertext, aad, payload_digest,
pedersen_commitment y digest.

El factor secreto de apertura de Pedersen no viaja dentro del sobre público.

## Qué falta documentar / construir
- firma con identidad
- hora confiable
- custodia completa fuera de la máquina
