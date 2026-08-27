# Riesgos y límites (borrador)

## Qué sí ayuda el sistema actual
- Detectar si el sobre o el recibo se alteró después (integridad)
- Repetir las pruebas en otra máquina con el mismo código

## Qué no cubre hoy
- Si alguien controla la computadora completa, puede mentir el resultado local
- Si cambian la hora del sistema, los tiempos locales no son prueba fuerte
- Si reenvían un mensaje viejo, hace falta control anti-repetición explícito
- No sustituye firma con identidad verificada ni caja fuerte de llaves
- No es, por sí solo, prueba legal ni fiscal

## Uso honesto
Presentar el sistema como capa de registro y verificación offline,
no como garantía total de seguridad ni como certificado.
