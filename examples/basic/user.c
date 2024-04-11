#include <stdlib.h>

#define EXTISM_IMPLEMENTATION
#include "extism-pdk.h"

EXTISM_IMPORT_USER("some_function")
ExtismHandle some_function();

int32_t example() {
  extism_output_handle(some_function());
  return 0;
}
