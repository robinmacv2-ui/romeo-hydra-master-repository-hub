# Native C++ backend (CMake)

Autor: Luis Angel Vazquez Martinez

Biblioteca compartida `libromeo_native` con ABI C para Python (`ctypes`).

## Que hace

| Sin TFHE/HElib en el sistema | Con libs instaladas |
|------------------------------|---------------------|
| Compila en **modo stub** | Enlaza TFHE / HElib |
| `has_tfhe=0`, `has_helib=0` | Flags a 1 + selfcheck |
| SHA-256 nativo funciona | Igual + link real |

El paquete Python **sigue funcionando** sin compilar esto (RSA + Paillier via pip).

## Build (Linux / Termux / macOS)

```bash
cd native
mkdir -p build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .
./romeo_native_smoke
```

Salida esperada (stub):

```text
romeo_native_version: 0.1.2
has_tfhe=0 has_helib=0
sha256("romeo-hydra") = ...
tfhe_selfcheck=-1 TFHE not linked...
```

## Instalar la .so donde Python la encuentre

```bash
# desde native/build
export ROMEO_NATIVE_LIB=$PWD/libromeo_native.so   # Linux
# export ROMEO_NATIVE_LIB=$PWD/libromeo_native.dylib  # macOS
```

O copia a `/usr/local/lib` y corre `ldconfig` (Linux).

## Con TFHE / HElib del sistema

```bash
cmake .. -DROMEO_WITH_TFHE=ON -DROMEO_WITH_HELIB=ON
cmake --build .
```

CMake busca `libtfhe` / `libhelib`. Si no estan, compila stub sin error.

## Python

```python
from romeo_hydra.crypto.native_loader import load_native, native_status
print(native_status())
```

## Estructura

```text
native/
  CMakeLists.txt
  include/romeo_native.h
  src/romeo_native.cpp
  src/sha256_min.cpp
  src/tfhe_backend.cpp
  src/helib_backend.cpp
  src/smoke_main.cpp
  README.md
```
