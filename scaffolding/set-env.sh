#!/bin/sh

echo "=== set-env.sh: Loading environment variables ==="

# Source .env as the primary source of truth if it exists
if [ -f .env ]; then
  echo "[INFO] Found .env file, sourcing it as primary source of truth"
  source .env
  export $(grep -v '^\s*#' .env | grep -v '^\s*$' | sed 's/=.*//g' | xargs)
  while IFS= read -r line; do
    case "$line" in \#*|"") continue ;; esac
    var_name="${line%%=*}"
    echo "[LOADED] $var_name (from .env)"
  done < .env
else
  echo "[INFO] No .env file found, skipping"
fi

# Fill in any missing variables from .env.example* files
for example_file in .env.example*; do
  [ -f "$example_file" ] || continue
  echo "[INFO] Processing $example_file for missing variables"
  while IFS= read -r line; do
    # Skip comments and empty lines
    case "$line" in \#*|"") continue ;; esac
    # Extract variable name
    var_name="${line%%=*}"
    # Only export if the variable is not already set in the environment
    if eval "[ -z \"\${${var_name}+x}\" ]"; then
      echo "[SET]  $var_name (from $example_file)"
      eval "export $line"
    else
      echo "[SKIP] $var_name (already set in environment)"
    fi
  done < "$example_file"
done

echo "=== set-env.sh: Done ==="
