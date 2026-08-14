#include "romeo_native.h"
#include <cstdio>
#include <cstring>

#if ROMEO_HAS_TFHE
// When system TFHE is linked, include headers if available.
// Full circuit demos stay in upstream samples; here we only self-check link.
#if __has_include(<tfhe/tfhe.h>)
#  include <tfhe/tfhe.h>
#  define ROMEO_TFHE_HEADERS 1
#elif __has_include(<tfhe.h>)
#  include <tfhe.h>
#  define ROMEO_TFHE_HEADERS 1
#else
#  define ROMEO_TFHE_HEADERS 0
#endif
#endif

extern "C" int romeo_native_has_tfhe(void) {
#if ROMEO_HAS_TFHE
  return 1;
#else
  return 0;
#endif
}

extern "C" int romeo_native_tfhe_selfcheck(char* err, int err_len) {
#if !ROMEO_HAS_TFHE
  if (err && err_len > 0) {
    std::snprintf(err, err_len,
      "TFHE not linked. Install libtfhe and rebuild native/ with ROMEO_WITH_TFHE=ON");
  }
  return -1;
#else
#  if ROMEO_TFHE_HEADERS
  // Linked + headers: report success of link (full encrypt API is next engineering step).
  if (err && err_len > 0) {
    std::snprintf(err, err_len, "TFHE linked OK (headers present)");
  }
  return 0;
#  else
  if (err && err_len > 0) {
    std::snprintf(err, err_len, "TFHE library linked but headers not found at build time");
  }
  return 0;
#  endif
#endif
}
