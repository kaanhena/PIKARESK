// src/pages/Settings.js

export function Settings(root) {
  root.innerHTML = SettingsPage();
}

function SettingsPage() {
  return `
    <h2>Ayarlar</h2>
    <p>Uygulama ayarları burada olacak.</p>
  `;
}
