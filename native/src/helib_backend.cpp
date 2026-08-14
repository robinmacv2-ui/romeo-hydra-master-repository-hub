#include "romeo_native.h"
#include <cstdio>
#include <cstring>

#if ROMEO_HAS_HELIB
#if __has_include(<helib/helib.h>)
#  include <helib/helib.h>
#  define ROMEO_HELIB_HEADERS 1
#else
#  define ROMEO_HELIB_HEADERS 0
#endif
#endif

extern "C" int romeo_native_has_helib(void) {
#if ROMEO_HAS_HELIB
  return 1;
#else
  return 0;
#endif
}

extern "C" int romeo_native_helib_selfcheck(char* err, int err_len) {
#if !ROMEO_HAS_HELIB
  if (err && err_len > 0) {
    std::snprintf(err, err_len,
      "HElib not linked. Install HElib and rebuild native/ with ROMEO_WITH_HELIB=ON");
  }
  return -1;
#else
  if (err && err_len > 0) {
#  if ROMEO_HELIB_HEADERS
    std::snprintf(err, err_len, "HElib linked OK (headers present)");
#  else
    std::snprintf(err, err_len, "HElib library linked but headers not found at build time");
#  endif
  }
  return 0;
#endif
}
