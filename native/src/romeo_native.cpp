#include "romeo_native.h"
#include <cstdio>
#include <cstring>
#include <string>

namespace romeo_sha {
std::string sha256_hex(const unsigned char* data, size_t len);
}

extern "C" const char* romeo_native_version(void) {
  return "0.1.2";
}

extern "C" int romeo_native_status_json(char* buf, int buflen) {
  if (!buf || buflen < 32) return -1;
  int has_tfhe = romeo_native_has_tfhe();
  int has_helib = romeo_native_has_helib();
  int n = std::snprintf(
      buf, (size_t)buflen,
      "{\"version\":\"0.1.2\",\"backend\":\"romeo_native\",\"tfhe\":%s,\"helib\":%s,"
      "\"mode\":\"%s\",\"sha256\":true}",
      has_tfhe ? "true" : "false",
      has_helib ? "true" : "false",
      (has_tfhe || has_helib) ? "native-linked" : "stub");
  if (n < 0 || n >= buflen) return -1;
  return n;
}

extern "C" int romeo_native_sha256_hex(const unsigned char* data, int len, char* out_hex) {
  if (!out_hex || len < 0) return -1;
  if (len > 0 && !data) return -1;
  std::string h = romeo_sha::sha256_hex(data, (size_t)(len < 0 ? 0 : len));
  if (h.size() != 64) return -1;
  std::memcpy(out_hex, h.c_str(), 65);
  return 0;
}
