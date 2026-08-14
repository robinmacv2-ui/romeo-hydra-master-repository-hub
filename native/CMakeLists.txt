cmake_minimum_required(VERSION 3.16)
project(romeo_hydra_native LANGUAGES CXX)

# Esqueleto: enlaza TFHE/HElib SI el sistema los tiene instalados.
# No descarga ni compila esas libs automaticamente (son proyectos grandes).

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

option(ROMEO_WITH_TFHE "Link system libtfhe if found" ON)
option(ROMEO_WITH_HELIB "Link system HElib if found" ON)

find_library(TFHE_LIB NAMES tfhe tfhe-spqlios-fma)
find_library(HELIB_LIB NAMES helib HElib)

add_library(romeo_native_stub INTERFACE)

if(ROMEO_WITH_TFHE AND TFHE_LIB)
  message(STATUS "TFHE found: ${TFHE_LIB}")
  target_link_libraries(romeo_native_stub INTERFACE ${TFHE_LIB})
else()
  message(STATUS "TFHE not found — Python package still runs without native TFHE")
endif()

if(ROMEO_WITH_HELIB AND HELIB_LIB)
  message(STATUS "HElib found: ${HELIB_LIB}")
  target_link_libraries(romeo_native_stub INTERFACE ${HELIB_LIB})
else()
  message(STATUS "HElib not found — Python package still runs without native HElib")
endif()
