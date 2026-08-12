# ORIGEN Y TRAYECTORIA

## Cómo empezó esto

Hace 45 días no sabía programar.

No entendía la sintaxis de Python.  
No sabía qué era un compilador de C++.  
No tenía idea de qué significaban las dependencias de CMake.  
No sabía que Zenodo existía, ni que era un registro del CERN en Suiza, ni qué era un DOI.

No venía de una carrera de sistemas.  
No tenía un mentor técnico.  
No seguí un tutorial paso a paso pensado para principiantes.

La arquitectura de ROMEO-HYDRA no nació de una clase ni de un libro.  
Nació de una necesidad concreta: el dato en uso es vulnerable.  
La inteligencia artificial procesa información sensible sin una gobernanza real.  
Y no encontré una caja fuerte que resolviera eso de forma seria.

Así que empecé a construir una.

---

## Los subibajas

No fue lineal.

Hubo días enteros pelean­do con la terminal de Linux dentro de WSL.  
Errores de firmware.  
Configuraciones de Git que se rompían.  
Fallos de autenticación.  
Mensajes de compilación que no entendía y que me obligaban a volver a empezar.

Hubo momentos en los que el código no compilaba.  
Momentos en los que el puente entre Python y C++ no respondía.  
Momentos en los que la interfaz en React se caía por una dependencia mal declarada.

Y también hubo los momentos en los que algo finalmente funcionó.

El día que entendí qué era una capa de abstracción.  
El día que logré que un script de Python le ordenara a C++ construir la estructura matemática de la caja fuerte.  
El día que el motor TFHE compiló con la aceleración SPQLIOS_FMA directamente sobre el procesador.  
El día que corrí `git push` y apareció el mensaje:

```
Everything up-to-date
```

Ese mensaje, después de semanas de pelear con la terminal, valió más que cualquier explicación teórica.

---

## La validación formal

Cuando el código empezó a tomar forma, lo registré.

No por marketing.  
Por protección.

Indexé la propiedad intelectual en Zenodo a través de tres registros formales:

- Software
- Hardware
- Ontología

Eso no me convirtió en experto.  
Solo me dio un ancla: este trabajo existe, tiene fecha, tiene autor y tiene DOI.

---

## Dónde está hoy

Lo que empezó como una intuición se transformó en infraestructura ejecutable.

Hoy el repositorio contiene:

- Código C++ enlazado a un motor de cifrado homomórfico real (TFHE + SPQLIOS_FMA)
- Scripts en Python que orquestan y gobiernan el flujo
- Un dashboard construido en React + TypeScript + Vite
- Bitácoras, manifiestos y experimentos que todavía estoy ordenando

Está en un nivel de madurez TRL 4: ya no es solo teoría.  
Hay código que compila.  
Hay componentes que se comunican.  
Hay una interfaz que se puede abrir.

Todavía no es un producto terminado.  
Todavía falta limpiar, documentar y estabilizar.  
Pero ya no es una idea en un cuaderno.

Y hay una postulación en marcha ante aceleradoras como 500 Latam.

---

## Qué significa esto realmente

No soy un ingeniero de software con diez años de experiencia.  
Soy alguien que hace 45 días no sabía qué era un `import`.

Todo lo que está en este repositorio se construyó a pulso:  
error por error,  
compilación por compilación,  
commit por commit.

Si alguien entra a este repositorio buscando un framework pulido y listo para producción, no lo va a encontrar.  
Si entra buscando la evidencia de que una persona sin formación previa puede llegar a construir una arquitectura de cifrado y gobernanza real, aquí está.

Eso es ROMEO-HYDRA hasta hoy.

---

**Luis Ángel Vázquez Martínez**  
Agosto 2026
