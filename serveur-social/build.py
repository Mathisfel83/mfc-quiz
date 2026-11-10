"""Insère serveur-social/social-block.js dans index.html (idempotent)."""
import re, os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p=os.path.join(R,'index.html'); s=open(p).read(); b=open(os.path.join(R,'serveur-social','social-block.js')).read().rstrip()+'\n'
if '/* ==SOCIAL==' in s:
    s=re.sub(r'/\* ==SOCIAL==.*?/\* ==/SOCIAL== \*/\n', lambda m: b, s, flags=re.S)
else:
    a="var sp=document.getElementById('splash');"; assert a in s; s=s.replace(a, b+a,1)
open(p,'w').write(s); print('ok')
