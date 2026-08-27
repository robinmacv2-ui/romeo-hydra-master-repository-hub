# Caso de uso concreto (borrador)

## Escenario
Un operador intenta un comando peligroso (por ejemplo borrar fuera de la zona permitida).

## Qué debe pasar
1) El sistema lo deniega
2) Se escribe un recibo con la decisión "denegar"
3) Se puede comprobar después que el recibo no fue alterado

## Éxito medible
- Comando denegado
- Recibo presente
- Prueba de verificación en verde
- Mismo resultado al repetir la verificación

## Fuera de alcance de este caso
- Demostrar quién era el operador ante un juez
- Demostrar que el reloj era correcto
- Uso fiscal o societario
