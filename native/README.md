# Native backends (TFHE / HElib) — opcional

El wheel de Python **no** incluye libtfhe ni HElib (pesan mucho y son C++).

Tras `pip install romeo-hydra` ya tienes:

- numpy
- cryptography → RSA-OAEP-SHA256 real
- Paillier HE aditivo (pure Python)

## Cuando quieras TFHE / HElib de circuito completo

1. Compila e instala en el sistema:
   - TFHE: https://github.com/tfhe/tfhe
   - HElib: https://github.com/homenc/HElib
2. Comprueba:

```python
from romeo_hydra.crypto import he_status
print(he_status()["tfhe_native"])
print(he_status()["helib_native"])
```

Si `available` es `True`, el runtime detecto la `.so` / `.dylib`.
Si es `False`, el resto del paquete sigue funcionando (SHA256, RSA, Paillier).

## CMake (esqueleto)

Ver `native/CMakeLists.txt` — punto de partida para enlazar backends nativos.
No sustituye instalar las libs upstream.

Autor: Luis Angel Vazquez Martinez
