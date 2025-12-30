import "./Servers.css";

export function Servers(root) {
  root.innerHTML = `
    <div class="servers-empty">
      <div class="servers-empty-card">
        <div class="servers-empty-icon">??</div>
        <h2>Sunucu yok</h2>
        <p>Yeni sunucu olusturma ve katilma yakinda aktif olacak.</p>
        <button class="servers-empty-btn" type="button" disabled>Sunucu Ekle</button>
      </div>
    </div>
  `;
}
