#!/usr/bin/env bash
# Copie les fichiers de l'app web dans www/ (embarqués dans l'app iOS, rien n'est chargé à distance).
set -e
cd "$(dirname "$0")/.."
rm -rf www && mkdir -p www
cp index.html manifest.json www/
for f in *.js; do [ "$f" = "sw.js" ] || cp "$f" www/; done
cp -R assets toon vendor www/
echo "www prêt : $(du -sh www | cut -f1)"
