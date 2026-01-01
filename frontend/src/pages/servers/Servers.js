import "./Servers.css";
import { Room, RoomEvent, createLocalAudioTrack } from "livekit-client";
import { watchAuth } from "../../services/authService.js";
import { http } from "../../services/http.js";
import {
  createInvite,
  createServerForUser,
  deleteServer,
  listenServerPresence,
  joinServerByInvite,
  listenServerMessages,
  listenUserServers,
  loadVoiceSettings,
  markServerMessagesRead,
  upsertServerPresence,
  saveVoiceSettings,
  sendServerMessage,
} from "../../services/serverService.js";

export function Servers(root) {
  root.innerHTML = `
    <div class="servers-module">
      <header class="servers-header">
        <div class="server-tabs" id="serverTabs"></div>
        <div class="server-actions">
          <button class="server-action-btn" id="addServerBtn" type="button">Sunucu Ekle</button>
        </div>
      </header>

      <div class="servers-content">
        <aside class="voice-panel">
          <div class="panel-header">
            <h2 class="panel-title" id="serverTitle">Sunucu sec</h2>
            <p class="panel-subtitle" id="serverSubtitle">0 kisi cevrimici</p>
          </div>
          <div class="voice-list" id="voiceList">
            <div class="voice-empty">Sesli odada kimse yok.</div>
          </div>
          <div class="voice-audio" id="voiceAudio"></div>
          <div class="voice-controls">
            <button class="control-btn mic-btn" id="micBtn" type="button">
              <span class="icon">MIC</span>
              <span>Mikrofon</span>
            </button>
            <button class="control-btn join-btn" id="joinBtn" type="button">
              <span class="icon">CALL</span>
              <span>Sesli Odaya Katil</span>
            </button>
            <button class="control-btn" id="settingsBtn" type="button">
              <span class="icon">SET</span>
              <span>Ses Ayarlari</span>
            </button>
            <div class="voice-settings" id="voiceSettings">
              <div class="setting-section-title">Sunucu Ayarlari</div>
              <div class="setting-item">
                <div class="setting-label">
                  <span>Ses Efekti</span>
                </div>
                <select class="servers-select" id="voiceEffectSelect">
                  <option value="card-1">Dalga Efekti</option>
                  <option value="card-2">Ses Cubuklari</option>
                  <option value="card-3">Genisleyen Daire</option>
                  <option value="card-4">Parcacik Patlamasi</option>
                  <option value="card-5">Isiltili Parilti</option>
                  <option value="card-6">Radar Tarama</option>
                  <option value="card-7">Cift Sarmal</option>
                  <option value="card-8">Ses Dalgasi</option>
                  <option value="card-9">Neon Nabiz</option>
                  <option value="card-10">Geometrik Sekil</option>
                  <option value="card-11">Enerji Kalkani</option>
                  <option value="card-12">Dijital Yagmur</option>
                  <option value="card-13">Hologram Glitch</option>
                  <option value="card-14">Plazma Topu</option>
                  <option value="card-15">Kuantum Akisi</option>
                  <option value="card-16">Sarmal Dalga</option>
                  <option value="card-17">Sonik Patlama</option>
                  <option value="card-18">Yildiz Takimyildizi</option>
                  <option value="card-19">Frekans Barlari</option>
                  <option value="card-20">Binary Kod</option>
                  <option value="card-21">Kristal Yansima</option>
                  <option value="card-22">Manyetik Alan</option>
                  <option value="card-23">Lazer Isini</option>
                  <option value="card-24">Kuyruklu Yildiz</option>
                  <option value="card-25">Dalgalanma</option>
                  <option value="card-26">Pixel Firtinasi</option>
                  <option value="card-27">Kuzey Isiklari</option>
                  <option value="card-28">Elektrik Kivilcimi</option>
                  <option value="card-29">Girdap Donusu</option>
                  <option value="card-30">Sinyal Kulesi</option>
                  <option value="card-31">Altigen Izgara</option>
                  <option value="card-32">Sarkac Salinimi</option>
                  <option value="card-33">Siber Devre</option>
                  <option value="card-34">Nefes Isigi</option>
                  <option value="card-35">Uydu Yorungesi</option>
                  <option value="card-36">Ates Titremesi</option>
                  <option value="card-37">DNA Ipligi</option>
                  <option value="card-38">Spektrum Analiz</option>
                  <option value="card-39">Yercekimi Kuyusu</option>
                  <option value="card-40">Mors Kodu</option>
                  <option value="card-41">Balon Patlamasi</option>
                  <option value="card-42">Wifi Sinyali</option>
                  <option value="card-43">Prizma Ayrisimi</option>
                  <option value="card-44">Sok Dalgasi</option>
                  <option value="card-45">Sonar Pingi</option>
                  <option value="card-46">Enerji Cekirdegi</option>
                  <option value="card-47">Zaman Catlagi</option>
                  <option value="card-48">Foton Isini</option>
                  <option value="card-49">Rezonans</option>
                  <option value="card-50">Kozmik Toz</option>
                </select>
              </div>
              <div class="setting-section-title">Ses Ayarlari</div>
              <div class="setting-item">
                <div class="setting-label">
                  <span>Ses Seviyesi</span>
                  <span class="setting-value" id="volumeValue">70%</span>
                </div>
                <input type="range" min="0" max="100" value="70" class="slider" id="volumeSlider">
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <span>Mikrofon Hassasiyeti</span>
                  <span class="setting-value" id="sensitivityValue">50%</span>
                </div>
                <input type="range" min="0" max="100" value="50" class="slider" id="sensitivitySlider">
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <span>Gurultu Engelleme</span>
                  <button class="toggle-switch" id="noiseToggle" type="button"></button>
                </div>
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <span>Yanki Onleme</span>
                  <button class="toggle-switch" id="echoToggle" type="button"></button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main class="chat-panel">
          <div class="chat-header">
            <h3 class="chat-title" id="chatTitle">Genel Sohbet</h3>
            <div class="chat-actions">
              <button class="chat-action-btn" id="inviteBtn" type="button">Davet Et</button>
              <button class="chat-action-btn danger" id="deleteServerBtn" type="button">Sunucuyu Sil</button>
            </div>
          </div>
          <div class="chat-messages" id="messages">
            <div class="chat-empty" id="chatEmpty">Henuz mesaj yok.</div>
          </div>
          <div class="chat-input-area">
            <div class="input-wrapper">
              <input type="text" class="chat-input" placeholder="Mesaj yaz..." id="input">
              <button class="send-btn" id="sendBtn" type="button">&#8594;</button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <div class="servers-modal" id="addServerModal" aria-hidden="true">
      <div class="servers-modal-backdrop" data-close="add"></div>
      <div class="servers-modal-card">
        <h3>Sunucu Ekle</h3>
        <p>Yeni bir sunucu adi belirle.</p>
        <div class="servers-modal-section">
          <input class="servers-input" id="serverNameInput" placeholder="Ornek: My Server" type="text">
          <button class="primary-btn" id="createServerBtn" type="button">Olustur</button>
          <div class="servers-hint" id="serverLimitHint"></div>
        </div>
        <div class="servers-divider"></div>
        <div class="servers-modal-section">
          <p>Davet kodu ile bir sunucuya katil.</p>
          <input class="servers-input" id="inviteCodeInput" placeholder="Davet kodu" type="text">
          <button class="primary-btn" id="joinServerBtn" type="button">Katil</button>
        </div>
        <div class="servers-modal-actions">
          <button class="ghost-btn" data-close="add" type="button">Kapat</button>
        </div>
      </div>
    </div>

    <div class="servers-modal" id="inviteModal" aria-hidden="true">
      <div class="servers-modal-backdrop" data-close="invite"></div>
      <div class="servers-modal-card">
        <h3>Davet Et</h3>
        <p id="inviteDesc">Davet linkini paylas.</p>
        <input class="servers-input" id="inviteEmailInput" placeholder="E-posta (opsiyonel)" type="email">
        <div class="invite-code">
          <span id="inviteCode">---</span>
          <button class="ghost-btn" id="copyInviteBtn" type="button">Kopyala</button>
        </div>
        <div class="servers-modal-actions">
          <button class="ghost-btn" data-close="invite" type="button">Kapat</button>
          <button class="primary-btn" id="sendInviteBtn" type="button">Davet Gonder</button>
        </div>
      </div>
    </div>

    <div class="servers-modal" id="deleteServerModal" aria-hidden="true">
      <div class="servers-modal-backdrop" data-close="delete"></div>
      <div class="servers-modal-card">
        <h3>Sunucuyu Sil</h3>
        <p id="deleteServerDesc">Bu islem geri alinmaz.</p>
        <div class="servers-modal-actions">
          <button class="ghost-btn" data-close="delete" type="button">Vazgec</button>
          <button class="primary-btn danger" id="confirmDeleteServerBtn" type="button">Sil</button>
        </div>
      </div>
    </div>
  `;

  const serverTabs = root.querySelector("#serverTabs");
  const addServerBtn = root.querySelector("#addServerBtn");
  const inviteBtn = root.querySelector("#inviteBtn");
  const deleteServerBtn = root.querySelector("#deleteServerBtn");
  const serverTitle = root.querySelector("#serverTitle");
  const serverSubtitle = root.querySelector("#serverSubtitle");
  const chatTitle = root.querySelector("#chatTitle");
  const chatEmpty = root.querySelector("#chatEmpty");
  const messages = root.querySelector("#messages");
  const voiceList = root.querySelector("#voiceList");
  const voiceAudio = root.querySelector("#voiceAudio");

  const addServerModal = root.querySelector("#addServerModal");
  const inviteModal = root.querySelector("#inviteModal");
  const deleteServerModal = root.querySelector("#deleteServerModal");
  const serverNameInput = root.querySelector("#serverNameInput");
  const createServerBtn = root.querySelector("#createServerBtn");
  const inviteCodeInput = root.querySelector("#inviteCodeInput");
  const joinServerBtn = root.querySelector("#joinServerBtn");
  const serverLimitHint = root.querySelector("#serverLimitHint");
  const inviteEmailInput = root.querySelector("#inviteEmailInput");
  const inviteCode = root.querySelector("#inviteCode");
  const inviteDesc = root.querySelector("#inviteDesc");
  const deleteServerDesc = root.querySelector("#deleteServerDesc");
  const copyInviteBtn = root.querySelector("#copyInviteBtn");
  const sendInviteBtn = root.querySelector("#sendInviteBtn");
  const confirmDeleteServerBtn = root.querySelector("#confirmDeleteServerBtn");

  const micBtn = root.querySelector("#micBtn");
  const joinBtn = root.querySelector("#joinBtn");
  const settingsBtn = root.querySelector("#settingsBtn");
  const voiceSettings = root.querySelector("#voiceSettings");
  const volumeSlider = root.querySelector("#volumeSlider");
  const volumeValue = root.querySelector("#volumeValue");
  const sensitivitySlider = root.querySelector("#sensitivitySlider");
  const sensitivityValue = root.querySelector("#sensitivityValue");
  const noiseToggle = root.querySelector("#noiseToggle");
  const echoToggle = root.querySelector("#echoToggle");
  const voiceEffectSelect = root.querySelector("#voiceEffectSelect");

  const input = root.querySelector("#input");
  const sendBtn = root.querySelector("#sendBtn");

  let currentUser = null;
  let servers = [];
  let activeServerId = "";
  let pendingDeleteServerId = "";
  let stopServers = null;
  let stopMembers = null;
  let stopMessages = null;
  let stopPresence = null;
  let presenceTimer = null;
  let lastPresenceMembers = [];
  let lastPresenceSignature = "";
  const PRESENCE_PING_MS = 20000;
  const PRESENCE_ACTIVE_MS = 60000;
  let voiceConfig = {
    volume: 70,
    sensitivity: 50,
    noise: false,
    echo: false,
    voiceEffect: "card-27",
  };
  let livekitRoom = null;
  let localAudioTrack = null;
  let isConnecting = false;
  let micEnabled = true;
  let speakingIds = new Set();

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification show";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("show"), 1600);
    setTimeout(() => toast.remove(), 2000);
  }

  function handleFirestoreError(error, fallback) {
    console.warn(fallback, error);
    const message = error?.message || fallback;
    showToast(message);
  }

  function openModal(modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function applyVoiceSettings(settings) {
    volumeSlider.value = String(settings.volume);
    volumeValue.textContent = `${settings.volume}%`;
    sensitivitySlider.value = String(settings.sensitivity);
    sensitivityValue.textContent = `${settings.sensitivity}%`;
    noiseToggle.classList.toggle("active", settings.noise);
    echoToggle.classList.toggle("active", settings.echo);
    const effect = settings.voiceEffect || "card-27";
    if (voiceEffectSelect) {
      voiceEffectSelect.value = effect;
    }
    if (voiceList) {
      voiceList.dataset.effect = effect;
    }
  }

  function renderTabs() {
    serverTabs.innerHTML = "";
    if (!servers.length) {
      serverTabs.innerHTML = `<div class="server-tabs-empty">Sunucu yok</div>`;
      serverTitle.textContent = "Sunucu sec";
      serverSubtitle.textContent = "0 kisi cevrimici";
      chatTitle.textContent = "Genel Sohbet";
      inviteBtn.disabled = true;
      joinBtn.disabled = true;
      input.disabled = true;
      sendBtn.disabled = true;
      if (deleteServerBtn) {
        deleteServerBtn.style.display = "none";
        deleteServerBtn.disabled = true;
      }
      return;
    }
    inviteBtn.disabled = false;
    joinBtn.disabled = false;
    input.disabled = false;
    sendBtn.disabled = false;
    servers.forEach((server) => {
      const btn = document.createElement("button");
      btn.className = `server-tab${server.id === activeServerId ? " active" : ""}`;
      btn.type = "button";
      btn.textContent = server.name;
      btn.addEventListener("click", () => {
        setActiveServer(server.id);
      });
      serverTabs.appendChild(btn);
    });
    updateServerMeta();
  }

  function updateServerMeta() {
    const server = servers.find((item) => item.id === activeServerId);
    if (!server) return;
    serverTitle.textContent = server.name;
    chatTitle.textContent = `${server.name} Sohbet`;
    inviteDesc.textContent = `${server.name} sunucusuna davet linki olustur.`;
    if (deleteServerBtn) {
      const canDelete = currentUser && server.ownerId === currentUser.uid;
      deleteServerBtn.style.display = canDelete ? "" : "none";
      deleteServerBtn.disabled = !canDelete;
    }
  }

  function renderVoiceMembers(members) {
    if (!members.length) {
      voiceList.innerHTML = `<div class="voice-empty">Sesli odada kimse yok.</div>`;
      serverSubtitle.textContent = "0 kisi cevrimici";
      return;
    }
    serverSubtitle.textContent = `${members.length} kisi cevrimici`;
    const sorted = [...members].sort((a, b) => {
      const nameA = (a.userName || "").toLowerCase();
      const nameB = (b.userName || "").toLowerCase();
      return nameA.localeCompare(nameB, "tr");
    });
    voiceList.innerHTML = sorted
      .map((member) => {
        const name = member.userName || "Kullanici";
        const initial = name[0]?.toUpperCase() || "K";
        const status = member.voice ? "Dinliyor" : "Cevrimici";
        return `
          <div class="voice-user" data-user-id="${member.userId || ""}">
            <div class="voice-avatar">
              ${initial}
              <span class="speaking-dot" aria-hidden="true"></span>
            </div>
            <div>
              <div class="voice-name">${name}</div>
              <div class="voice-status">${status}</div>
            </div>
          </div>
        `;
      })
      .join("");
    updateSpeakingIndicators();
  }

  function computePresenceSignature(members) {
    return members
      .map((member) => `${member.userId || ""}:${member.voice ? "v" : "o"}`)
      .sort()
      .join("|");
  }

  function renderVoiceParticipants(participants) {
    const onlineMembers = lastPresenceMembers || [];
    const participantsById = new Map(
      participants.map((participant) => [participant.identity || participant.sid, participant])
    );
    const merged = new Map();

    onlineMembers.forEach((member) => {
      if (!member?.userId) return;
      merged.set(member.userId, { ...member, voice: participantsById.has(member.userId) });
    });

    participantsById.forEach((participant, key) => {
      if (merged.has(key)) return;
      merged.set(key, {
        userId: key,
        userName: participant.name || participant.identity || "Kullanici",
        voice: true,
      });
    });

    renderVoiceMembers(Array.from(merged.values()));
  }

  function renderMessages(items) {
    if (!items.length) {
      messages.innerHTML = `<div class="chat-empty" id="chatEmpty">Henuz mesaj yok.</div>`;
      return;
    }
    messages.innerHTML = items
      .map((message) => {
        const name = message.userName || "Kullanici";
        const initial = name[0]?.toUpperCase() || "K";
        const isOwn = message.userId && currentUser?.uid === message.userId;
        const readByCount = Array.isArray(message.readBy) ? message.readBy.length : 0;
        const status = isOwn ? (readByCount > 1 ? "Goruldu" : "Gonderildi") : "";
        const time =
          message.createdAt?.toDate?.().toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }) || "";
        return `
          <div class="message">
            <div class="msg-avatar">${initial}</div>
            <div class="msg-content">
              <div class="msg-header">
                <span class="msg-author">${name}</span>
                <span class="msg-time">${time}</span>
                ${status ? `<span class="msg-status">${status}</span>` : ""}
              </div>
              <div class="msg-text">${message.text || ""}</div>
            </div>
          </div>
        `;
      })
      .join("");
    messages.scrollTop = messages.scrollHeight;
  }

  function clearChat() {
    messages.innerHTML = `<div class="chat-empty" id="chatEmpty">Henuz mesaj yok.</div>`;
  }

  function stopActiveListeners() {
    if (stopMembers) stopMembers();
    if (stopMessages) stopMessages();
    stopMembers = null;
    stopMessages = null;
  }

  function stopPresenceTracking() {
    if (stopPresence) stopPresence();
    stopPresence = null;
    if (presenceTimer) {
      window.clearInterval(presenceTimer);
      presenceTimer = null;
    }
  }

  async function setPresence(serverId, online) {
    if (!currentUser || !serverId) return;
    try {
      await upsertServerPresence({
        serverId,
        uid: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        online,
      });
    } catch (error) {
      handleFirestoreError(error, "Presence guncellenemedi.");
    }
  }

  function startPresenceTracking(serverId) {
    if (!serverId || !currentUser) return;
    setPresence(serverId, true);
    presenceTimer = window.setInterval(() => {
      setPresence(serverId, true);
    }, PRESENCE_PING_MS);
  }

  function normalizePresence(items) {
    const now = Date.now();
    return items.filter((item) => {
      if (!item?.online) return false;
      const ts = item.lastSeen?.toDate?.();
      if (!ts) return false;
      return now - ts.getTime() <= PRESENCE_ACTIVE_MS;
    });
  }

  function updateJoinButton(connected) {
    joinBtn.classList.toggle("active", connected);
    const icon = joinBtn.querySelector(".icon");
    const text = joinBtn.querySelector("span:last-child");
    icon.textContent = connected ? "CALL" : "EXIT";
    text.textContent = connected ? "Sesli Odadan Ayril" : "Sesli Odaya Katil";
  }

  function updateMicButton(enabled) {
    micBtn.classList.toggle("active", enabled);
    const icon = micBtn.querySelector(".icon");
    const text = micBtn.querySelector("span:last-child");
    icon.textContent = enabled ? "ON" : "MIC";
    text.textContent = enabled ? "Mikrofon Acik" : "Mikrofon";
  }

  function attachTrack(track) {
    const element = track.attach();
    element.dataset.trackSid = track.sid;
    voiceAudio.appendChild(element);
  }

  function detachTrack(track) {
    track.detach().forEach((el) => el.remove());
  }

  function collectParticipants(room) {
    const participants = [];
    if (room?.localParticipant) {
      participants.push(room.localParticipant);
    }
    room?.participants?.forEach((participant) => participants.push(participant));
    return participants;
  }

  function refreshVoiceParticipants() {
    if (!livekitRoom) return;
    renderVoiceParticipants(collectParticipants(livekitRoom));
  }

  function updateSpeakingIndicators() {
    if (!voiceList) return;
    voiceList.querySelectorAll(".voice-user").forEach((item) => {
      const uid = item.getAttribute("data-user-id");
      item.classList.toggle("speaking", !!uid && speakingIds.has(uid));
    });
  }

  function cleanupLivekit() {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack = null;
    }
    if (livekitRoom) {
      livekitRoom.disconnect();
      livekitRoom = null;
    }
    voiceAudio.innerHTML = "";
    speakingIds = new Set();
    renderVoiceMembers([]);
    updateJoinButton(false);
  }

  async function connectLivekit() {
    if (!currentUser || !activeServerId || livekitRoom || isConnecting) return;
    isConnecting = true;
    try {
      const tokenUrl =
        import.meta.env.VITE_LIVEKIT_TOKEN_URL ||
        "https://us-central1-pikaresk-7f80b.cloudfunctions.net/livekitToken";
      const response = await http(tokenUrl, {
        method: "POST",
        body: {
          room: activeServerId,
          identity: currentUser.uid,
          name: currentUser.displayName || currentUser.email || "Kullanici",
        },
      });
      const room = new Room({ adaptiveStream: true, dynacast: true });
      livekitRoom = room;

      room.on(RoomEvent.ParticipantConnected, refreshVoiceParticipants);
      room.on(RoomEvent.ParticipantDisconnected, refreshVoiceParticipants);
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const ids = speakers.map((speaker) => speaker.identity).filter(Boolean);
        speakingIds = new Set(ids);
        updateSpeakingIndicators();
      });
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log("LiveKit state:", state);
      });
      room.on(RoomEvent.Disconnected, (reason) => {
        console.warn("LiveKit disconnected:", reason);
        if (reason === "duplicate_identity") {
          showToast("Bu hesap baska bir cihazda baglandi.");
        } else {
          showToast("Sesli baglanti koptu.");
        }
        cleanupLivekit();
      });
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === "audio") {
          attachTrack(track);
        }
      });
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === "audio") {
          detachTrack(track);
        }
      });

      await room.connect(response.url, response.token);
      localAudioTrack = await createLocalAudioTrack();
      await room.localParticipant.publishTrack(localAudioTrack);
      if (!micEnabled) {
        await localAudioTrack.mute();
      }
      updateJoinButton(true);
      updateMicButton(micEnabled);
      refreshVoiceParticipants();
    } catch (error) {
      console.warn("LiveKit connect error:", error);
      showToast(error?.message || "Sesli sohbet baslatilamadi.");
      cleanupLivekit();
    } finally {
      isConnecting = false;
    }
  }

  function setActiveServer(serverId) {
    if (!serverId) return;
    if (activeServerId === serverId) {
      updateServerMeta();
      return;
    }
    const previousServerId = activeServerId;
    activeServerId = serverId;
    if (previousServerId) {
      setPresence(previousServerId, false);
    }
    if (livekitRoom) {
      cleanupLivekit();
    }
    updateServerMeta();
    renderTabs();
    clearChat();
    stopActiveListeners();
    stopPresenceTracking();
    stopPresence = listenServerPresence(
      activeServerId,
      (items) => {
        const online = normalizePresence(items);
        lastPresenceMembers = online;
        const signature = computePresenceSignature(online);
        if (signature === lastPresenceSignature && !livekitRoom) return;
        lastPresenceSignature = signature;
        if (livekitRoom) {
          renderVoiceParticipants(collectParticipants(livekitRoom));
          return;
        }
        renderVoiceMembers(online);
      },
      (error) => {
        renderVoiceMembers([]);
        handleFirestoreError(error, "Presence verisi alinamadi.");
      }
    );
    stopMessages = listenServerMessages(
      activeServerId,
      (items) => {
        renderMessages(items);
        if (currentUser) {
          markServerMessagesRead({
            serverId: activeServerId,
            uid: currentUser.uid,
            items,
          }).catch((error) => {
            handleFirestoreError(error, "Mesajlar okunamadi.");
          });
        }
      },
      (error) => {
        clearChat();
        handleFirestoreError(error, "Mesajlar alinamadi.");
      }
    );
    startPresenceTracking(activeServerId);
  }

  function updateServerLimitHint() {
    if (!currentUser) {
      serverLimitHint.textContent = "Sunucu olusturmak icin giris yap.";
      return;
    }
    const ownsServer = servers.some((server) => server.ownerId === currentUser.uid);
    if (ownsServer) {
      serverLimitHint.textContent = "Her kullanici su an sadece 1 sunucu olusturabilir.";
    } else {
      serverLimitHint.textContent = "";
    }
  }

  addServerBtn.addEventListener("click", () => {
    serverNameInput.value = "";
    inviteCodeInput.value = "";
    updateServerLimitHint();
    openModal(addServerModal);
    serverNameInput.focus();
  });

  createServerBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showToast("Giris yapmalisin.");
      return;
    }
    const name = serverNameInput.value.trim();
    if (!name) return;
    try {
      await createServerForUser({
        uid: currentUser.uid,
        name,
        userName: currentUser.displayName || currentUser.email,
      });
      serverNameInput.value = "";
      closeModal(addServerModal);
    } catch (error) {
      showToast(error?.message || "Sunucu olusturulamadi.");
    }
  });

  joinServerBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showToast("Giris yapmalisin.");
      return;
    }
    const code = inviteCodeInput.value.trim().toUpperCase();
    if (!code) return;
    try {
      const serverId = await joinServerByInvite({
        code,
        uid: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
      });
      inviteCodeInput.value = "";
      closeModal(addServerModal);
      setActiveServer(serverId);
    } catch (error) {
      showToast(error?.message || "Davet kodu gecersiz.");
    }
  });

  inviteBtn.addEventListener("click", async () => {
    if (!activeServerId || !currentUser) return;
    inviteEmailInput.value = "";
    inviteCode.textContent = "---";
    try {
      const code = await createInvite({
        serverId: activeServerId,
        createdBy: currentUser.uid,
      });
      inviteCode.textContent = code;
      openModal(inviteModal);
    } catch (error) {
      showToast(error?.message || "Davet kodu olusturulamadi.");
    }
  });

  deleteServerBtn?.addEventListener("click", async () => {
    if (!activeServerId || !currentUser) return;
    const server = servers.find((item) => item.id === activeServerId);
    if (!server || server.ownerId !== currentUser.uid) return;
    pendingDeleteServerId = activeServerId;
    if (deleteServerDesc) {
      deleteServerDesc.textContent = `${server.name} sunucusu kalici olarak silinecek.`;
    }
    openModal(deleteServerModal);
  });

  confirmDeleteServerBtn?.addEventListener("click", async () => {
    if (!pendingDeleteServerId || !currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      await deleteServer({ serverId: pendingDeleteServerId, token });
      cleanupLivekit();
      closeModal(deleteServerModal);
      pendingDeleteServerId = "";
      showToast("Sunucu silindi.");
    } catch (error) {
      showToast(error?.message || "Sunucu silinemedi.");
    }
  });

  copyInviteBtn.addEventListener("click", () => {
    const text = inviteCode.textContent.trim();
    if (!text || text === "---") return;
    navigator.clipboard?.writeText(text).catch(() => {});
  });

  sendInviteBtn.addEventListener("click", () => {
    const email = inviteEmailInput.value.trim();
    if (email) {
      inviteEmailInput.value = "";
    }
    closeModal(inviteModal);
  });

  root.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-close");
      if (target === "add") closeModal(addServerModal);
      if (target === "invite") closeModal(inviteModal);
      if (target === "delete") {
        pendingDeleteServerId = "";
        closeModal(deleteServerModal);
      }
    });
  });

  settingsBtn.addEventListener("click", () => {
    voiceSettings.classList.toggle("open");
  });

  micBtn.addEventListener("click", () => {
    micEnabled = !micEnabled;
    updateMicButton(micEnabled);
    if (localAudioTrack) {
      if (micEnabled) {
        localAudioTrack.unmute();
      } else {
        localAudioTrack.mute();
      }
    }
  });

  joinBtn.addEventListener("click", async () => {
    if (livekitRoom) {
      cleanupLivekit();
      return;
    }
    await connectLivekit();
  });

  volumeSlider.addEventListener("input", async (event) => {
    voiceConfig.volume = Number(event.target.value);
    volumeValue.textContent = `${voiceConfig.volume}%`;
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  sensitivitySlider.addEventListener("input", async (event) => {
    voiceConfig.sensitivity = Number(event.target.value);
    sensitivityValue.textContent = `${voiceConfig.sensitivity}%`;
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  noiseToggle.addEventListener("click", async () => {
    voiceConfig.noise = !voiceConfig.noise;
    noiseToggle.classList.toggle("active", voiceConfig.noise);
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  echoToggle.addEventListener("click", async () => {
    voiceConfig.echo = !voiceConfig.echo;
    echoToggle.classList.toggle("active", voiceConfig.echo);
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  voiceEffectSelect?.addEventListener("change", async (event) => {
    voiceConfig.voiceEffect = event.target.value;
    if (voiceList) {
      voiceList.dataset.effect = voiceConfig.voiceEffect;
    }
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  async function sendMessage() {
    if (!activeServerId || !currentUser) return;
    const text = input.value.trim();
    if (!text) return;
    try {
      await sendServerMessage({
        serverId: activeServerId,
        uid: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        text,
      });
      input.value = "";
    } catch (error) {
      handleFirestoreError(error, "Mesaj gonderilemedi.");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendMessage();
  });

  window.addEventListener("beforeunload", () => {
    if (activeServerId) {
      setPresence(activeServerId, false);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!activeServerId || !currentUser) return;
    if (document.hidden) {
      setPresence(activeServerId, false);
      return;
    }
    setPresence(activeServerId, true);
  });

  watchAuth((user) => {
    currentUser = user;
    if (stopServers) stopServers();
    stopServers = null;
    stopActiveListeners();
    if (activeServerId) {
      setPresence(activeServerId, false);
    }
    stopPresenceTracking();
    cleanupLivekit();
    servers = [];
    activeServerId = "";
    renderTabs();
    renderVoiceMembers([]);
    clearChat();
    if (!user) return;

    applyVoiceSettings(voiceConfig);
    loadVoiceSettings(user.uid)
      .then((settings) => {
        if (settings) {
          voiceConfig = {
            volume: settings.volume ?? 70,
            sensitivity: settings.sensitivity ?? 50,
            noise: !!settings.noise,
            echo: !!settings.echo,
            voiceEffect: settings.voiceEffect || "card-27",
          };
          applyVoiceSettings(voiceConfig);
        }
      })
      .catch(() => {});

    stopServers = listenUserServers(
      user.uid,
      (items) => {
        servers = items;
        if (!servers.length) {
          activeServerId = "";
          renderTabs();
          renderVoiceMembers([]);
          clearChat();
          return;
        }
        const nextServerId =
          activeServerId && servers.some((server) => server.id === activeServerId)
            ? activeServerId
            : servers[0].id;
        renderTabs();
        setActiveServer(nextServerId);
        updateServerLimitHint();
      },
      () => {
        servers = [];
        activeServerId = "";
        renderTabs();
        renderVoiceMembers([]);
        clearChat();
      }
    );
  });
}
