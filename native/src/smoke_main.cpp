#include "romeo_native.h"
#include <cstdio>
#include <cstring>

int main() {
  char status[512];
  char err[256];
  char hex[65];

  std::printf("romeo_native_version: %s\n", romeo_native_version());
  int n = romeo_native_status_json(status, sizeof status);
  std::printf("status (%d): %s\n", n, status);
  std::printf("has_tfhe=%d has_helib=%d\n",
              romeo_native_has_tfhe(), romeo_native_has_helib());

  const char* msg = "romeo-hydra";
  if (romeo_native_sha256_hex(reinterpret_cast<const unsigned char*>(msg),
                              (int)std::strlen(msg), hex) == 0) {
    std::printf("sha256(\"%s\") = %s\n", msg, hex);
  }

  int tr = romeo_native_tfhe_selfcheck(err, sizeof err);
  std::printf("tfhe_selfcheck=%d %s\n", tr, err);
  int hr = romeo_native_helib_selfcheck(err, sizeof err);
  std::printf("helib_selfcheck=%d %s\n", hr, err);

  return 0;
}
