// src/routes/routes.js

import { Home } from "../pages/Home.js";
import { Profile } from "../pages/Profile.js";
import { Settings } from "../pages/Settings.js";
import { Register } from "../pages/Register.js";
import { Login } from "../pages/Login.js";

import { Friends } from "../pages/Friends/Friends.js";
import DM from "../pages/dm/dm.js";

import { Games } from "../pages/games/Games.js";
import { Market } from "../pages/market/Market.js";
import { Servers } from "../pages/servers/Servers.js";

function ActivePage(title, desc) {
  return function (root) {
    root.innerHTML = `
      <div style="
        background:#0f172a;
        border-radius:16px;
        padding:32px;
      ">
        <h1 style="margin:0 0 8px 0;">${title}</h1>
        <p style="color:#94a3b8;">${desc}</p>
      </div>
    `;
  };
}

export const routes = {
  home: {
    page: Home,
    title: "Ana Sayfa",
  },

  profile: {
    page: Profile,
    title: "Profil",
  },

  friends: {
    page: Friends,
    title: "Arkadaslar",
  },

  dm: {
    page: DM,
    title: "Direkt Mesajlar",
  },

  servers: {
    page: Servers ?? ActivePage("Sunucular", "Sunucu ve kanal sistemi aktif."),
    title: "Sunucular",
  },

  games: {
    page: Games ?? ActivePage("Oyunlar", "Oyun modulleri aktif."),
    title: "Oyunlar",
  },

  market: {
    page: Market ?? ActivePage("Market", "E-pin ve magaza sistemi aktif."),
    title: "Market",
  },

  register: {
    page: Register,
    title: "Kayit Ol",
  },

  login: {
    page: Login,
    title: "Giris Yap",
  },

  settings: {
    page: Settings,
    title: "Ayarlar",
  },
};
