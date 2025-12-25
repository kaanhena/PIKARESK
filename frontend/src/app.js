mport { FriendsPage, initializeFriendsPage } from './friends.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  
  // Friends sayfasını yükle
  appContainer.innerHTML = FriendsPage();
  
  // Friends sayfasını başlat
  initializeFriendsPage();
});