#!/bin/zsh
# Redacta con OmniRoute (Gemini Flash) cada spec que aún no tenga borrador. Uno tras otro.
cd "$(dirname "$0")/build"
curl -s -o /dev/null http://127.0.0.1:20128/ || ~/.local/bin/omniroute serve --daemon --no-open >/dev/null 2>&1
for s in $(ls *.spec.txt | sed 's/.spec.txt//'); do
  [ -s "$s.raw.txt" ] && continue
  ~/.local/bin/omniroute --timeout 420000 chat -m gemini/gemini-3-flash-preview --no-history --max-tokens 20000 --reasoning-effort low --file "$s.spec.txt" > "$s.raw.txt" 2> "$s.err.txt"
  echo "$s: $(wc -w < $s.raw.txt) palabras"
done
