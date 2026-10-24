#!/bin/zsh
cd "$(dirname "$0")/build"
curl -s -o /dev/null -w "" http://127.0.0.1:20128/ || ~/.local/bin/omniroute serve --daemon --no-open >/dev/null 2>&1
for s in $(ls *.spec.txt | sed 's/.spec.txt//'); do
  [ -s "$s.out.html" ] && continue
  ~/.local/bin/omniroute --timeout 420000 chat -m gemini/gemini-3-flash-preview --no-history --max-tokens 20000 --reasoning-effort low --file "$s.spec.txt" > "$s.raw" 2> "$s.err"
  python3 - "$s" <<'PY'
import sys,re
s=sys.argv[1]; t=open(f'{s}.raw').read()
i=t.find('<p class="answer"'); t=t[i:] if i>=0 else ''
t=re.sub(r'```html|```','',t).strip()
open(f'{s}.out.html','w').write(t)
PY
  echo "$s: $(wc -w < $s.out.html) palabras"
done
