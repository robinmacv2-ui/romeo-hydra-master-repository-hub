/**
 * ROMEO-HYDRA native C ABI
 * ------------------------
 * Shared library loadable from Python via ctypes.
 *
 * Build WITHOUT system TFHE/HElib → stub mode (status reports 0).
 * Build WITH libs found by CMake → capabilities flags set to 1.
 *
 * Author: Luis Angel Vazquez Martinez
 */
#ifndef ROMEO_NATIVE_H
#define ROMEO_NATIVE_H

#ifdef __cplusplus
extern "C" {
#endif

#if defined(_WIN32)
#  define ROMEO_API __declspec(dllexport)
#else
#  define ROMEO_API __attribute__((visibility("default")))
#endif

/** Semantic version string, e.g. "0.1.2" */
ROMEO_API const char* romeo_native_version(void);

/**
 * JSON-like status into caller buffer (NUL-terminated).
 * Returns bytes written (excluding NUL), or -1 on error.
 */
ROMEO_API int romeo_native_status_json(char* buf, int buflen);

/** 1 if compiled with TFHE linked, else 0 */
ROMEO_API int romeo_native_has_tfhe(void);

/** 1 if compiled with HElib linked, else 0 */
ROMEO_API int romeo_native_has_helib(void);

/**
 * SHA-256 of input → 64 hex chars + NUL in out_hex (must be >= 65 bytes).
 * Returns 0 on success.
 */
ROMEO_API int romeo_native_sha256_hex(const unsigned char* data, int len, char* out_hex);

/**
 * TFHE stub / real hook.
 * If no TFHE: returns -1 and writes reason into err (if err_len > 0).
 * If TFHE linked: returns 0 and performs minimal self-check (or real path later).
 */
ROMEO_API int romeo_native_tfhe_selfcheck(char* err, int err_len);

/** Same pattern for HElib */
ROMEO_API int romeo_native_helib_selfcheck(char* err, int err_len);

#ifdef __cplusplus
}
#endif

#endif /* ROMEO_NATIVE_H */
