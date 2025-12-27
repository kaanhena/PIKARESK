// src/pages/Home.js

export function Home(root) {
  root.innerHTML = HomePage();
}

function HomePage() {
  return `
    <h2>Ana Sayfa</h2>
    <p>Hoş geldin.</p>
  `;
}
