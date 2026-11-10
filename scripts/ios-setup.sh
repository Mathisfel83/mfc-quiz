#!/usr/bin/env bash
# Génère le projet iOS (Capacitor), les icônes et les réglages. Lancé sur un Mac de GitHub Actions.
set -e
cd "$(dirname "$0")/.."
bash scripts/build-www.sh
[ -d ios ] || npx cap add ios
mkdir -p resources
cp assets/icon-1024.png resources/icon-only.png
cp assets/icon-1024.png resources/icon-foreground.png
npx capacitor-assets generate --ios --assetPath resources --iconBackgroundColor '#050A16' --splashBackgroundColor '#050A16' || echo "icônes : génération ignorée"
npx cap sync ios
PL=ios/App/App/Info.plist
/usr/libexec/PlistBuddy -c "Delete :ITSAppUsesNonExemptEncryption" "$PL" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$PL"
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName 'MFC Quiz'" "$PL" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string 'MFC Quiz'" "$PL"
/usr/libexec/PlistBuddy -c "Delete :UISupportedInterfaceOrientations" "$PL" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UISupportedInterfaceOrientations array" "$PL"
/usr/libexec/PlistBuddy -c "Add :UISupportedInterfaceOrientations:0 string UIInterfaceOrientationPortrait" "$PL"
echo "Projet iOS prêt"
