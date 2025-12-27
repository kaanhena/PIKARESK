// src/pages/Profile.js

export function Profile(root) {
  root.innerHTML = ProfilePage();
}

function ProfilePage() {
  return `
    <h2>Profil</h2>
    <p>Kullanıcı profili burada olacak.</p>
  `;
}
