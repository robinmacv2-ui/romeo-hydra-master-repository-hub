cmake_minimum_required(VERSION 3.16)
project(romeo_hydra_native VERSION 0.1.2 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

option(ROMEO_WITH_TFHE "Link system libtfhe if found" ON)
option(ROMEO_WITH_HELIB "Link system HElib if found" ON)
option(ROMEO_BUILD_TESTS "Build native smoke test" ON)

# ---------------------------------------------------------------------------
# Find optional system libraries (do not fail if missing)
# ---------------------------------------------------------------------------
set(ROMEO_HAS_TFHE 0)
set(ROMEO_HAS_HELIB 0)

if(ROMEO_WITH_TFHE)
  find_library(TFHE_LIB NAMES tfhe tfhe-spqlios-fma tfhe-fft)
  find_path(TFHE_INCLUDE NAMES tfhe.h tfhe/tfhe.h)
  if(TFHE_LIB)
    set(ROMEO_HAS_TFHE 1)
    message(STATUS "TFHE found: ${TFHE_LIB}")
  else()
    message(STATUS "TFHE not found — building stub (Python HE still works)")
  endif()
endif()

if(ROMEO_WITH_HELIB)
  find_library(HELIB_LIB NAMES helib HElib)
  find_path(HELIB_INCLUDE NAMES helib/helib.h)
  if(HELIB_LIB)
    set(ROMEO_HAS_HELIB 1)
    message(STATUS "HElib found: ${HELIB_LIB}")
  else()
    message(STATUS "HElib not found — building stub")
  endif()
endif()

# ---------------------------------------------------------------------------
# Library
# ---------------------------------------------------------------------------
add_library(romeo_native SHARED
  src/romeo_native.cpp
  src/sha256_min.cpp
  src/tfhe_backend.cpp
  src/helib_backend.cpp
)

target_include_directories(romeo_native
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

target_compile_definitions(romeo_native
  PRIVATE
    ROMEO_NATIVE_VERSION_MAJOR=0
    ROMEO_NATIVE_VERSION_MINOR=1
    ROMEO_NATIVE_VERSION_PATCH=2
    ROMEO_HAS_TFHE=${ROMEO_HAS_TFHE}
    ROMEO_HAS_HELIB=${ROMEO_HAS_HELIB}
)

if(ROMEO_HAS_TFHE)
  target_link_libraries(romeo_native PRIVATE ${TFHE_LIB})
  if(TFHE_INCLUDE)
    target_include_directories(romeo_native PRIVATE ${TFHE_INCLUDE})
  endif()
endif()

if(ROMEO_HAS_HELIB)
  target_link_libraries(romeo_native PRIVATE ${HELIB_LIB})
  if(HELIB_INCLUDE)
    target_include_directories(romeo_native PRIVATE ${HELIB_INCLUDE})
  endif()
endif()

# RPATH for local builds
if(APPLE)
  set_target_properties(romeo_native PROPERTIES
    INSTALL_RPATH "@loader_path"
    BUILD_WITH_INSTALL_RPATH TRUE
  )
elseif(UNIX)
  set_target_properties(romeo_native PROPERTIES
    INSTALL_RPATH "$ORIGIN"
    BUILD_WITH_INSTALL_RPATH TRUE
  )
endif()

# ---------------------------------------------------------------------------
# Smoke test executable
# ---------------------------------------------------------------------------
if(ROMEO_BUILD_TESTS)
  add_executable(romeo_native_smoke src/smoke_main.cpp)
  target_link_libraries(romeo_native_smoke PRIVATE romeo_native)
  target_include_directories(romeo_native_smoke PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/include)
endif()

# ---------------------------------------------------------------------------
# Install
# ---------------------------------------------------------------------------
include(GNUInstallDirs)
install(TARGETS romeo_native
  LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
  ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
  RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
install(FILES include/romeo_native.h DESTINATION ${CMAKE_INSTALL_INCLUDEDIR})

message(STATUS "romeo_native: TFHE=${ROMEO_HAS_TFHE} HElib=${ROMEO_HAS_HELIB}")
