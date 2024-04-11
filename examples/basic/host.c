#include <stdlib.h>

#define EXTISM_IMPLEMENTATION
#include "extism-pdk.h"

ExtismHandle some_function() {
  return extism_alloc_buf_from_sz("Hello, world!");
}
