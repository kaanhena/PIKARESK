export function HomePage(root){
  root.innerHTML = `
    <div class="container">
      <h1 class="h1">PİKAREKS</h1>
      <p class="p">Proje iskeleti hazır. Buraya gerçek modüller sırayla eklenecek.</p>

      <div class="card-grid">
        <section class="card span-6">
          <h3 class="card-title">Durum</h3>
          <p class="card-text">Frontend (Vite) + Backend (Node/Express) yapılandırması hazır.</p>
        </section>
        <section class="card span-6">
          <h3 class="card-title">Sonraki Adım</h3>
          <p class="card-text">Canva’dan gelen tasarım parçalarını component/page dosyalarına bölüp birleştireceğiz.</p>
        </section>
        <section class="card span-12">
          <h3 class="card-title">Modül Alanı</h3>
          <p class="card-text">Bu alan, dashboard kartları / widget’lar / içerik panelleri için ayrıldı.</p>
        </section>
      </div>
    </div>
  `;
}
