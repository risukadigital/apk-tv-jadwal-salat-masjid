const $ = (id) => document.getElementById(id);
let lastUpdated = "";
let prayerSchedule = null;
let fridayOverlay = null;
let iqamahBanner = null;

function escapeText(value) {
  return String(value ?? "");
}

function jakartaNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type).value;

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      weekday: "short"
    }).format(new Date())
  };
}

function updateClock() {
  const now = new Date();
  const options = { timeZone: "Asia/Jakarta" };

  $("clock").textContent = now.toLocaleTimeString("id-ID", {
    ...options,
    hour12: false
  });

  $("date").textContent = now.toLocaleDateString("id-ID", {
    ...options,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = escapeText(value) || "—";
}

function ensureSpecialElements() {
  if (!fridayOverlay) {
    fridayOverlay = document.createElement("div");
    fridayOverlay.id = "fridayPlainScreen";
    fridayOverlay.setAttribute("aria-label", "Mode Jumat");
    fridayOverlay.hidden = true;
    document.body.appendChild(fridayOverlay);
  }

  if (!iqamahBanner) {
    iqamahBanner = document.createElement("div");
    iqamahBanner.id = "iqamahCountdown";
    iqamahBanner.hidden = true;

    const heading = document.createElement("div");
    heading.id = "iqamahHeading";

    const timer = document.createElement("div");
    timer.id = "iqamahTimer";

    const note = document.createElement("div");
    note.id = "iqamahNote";
    note.textContent = "Persiapan menuju iqamah";

    iqamahBanner.append(heading, timer, note);
    document.body.appendChild(iqamahBanner);
  }
}

function updateSpecialModes() {
  ensureSpecialElements();

  const now = jakartaNow();
  const minutesNow = now.hour * 60 + now.minute;
  const isFriday = now.weekday === "Fri";
  const fridayMode =
    isFriday && minutesNow >= 12 * 60 && minutesNow < 13 * 60 + 30;

  fridayOverlay.hidden = !fridayMode;

  if (fridayMode) {
    iqamahBanner.hidden = true;
    return;
  }

  let activePrayer = null;

  if (prayerSchedule && prayerSchedule.date === now.date) {
    const prayers = [
      { name: "Subuh", time: prayerSchedule.subuh, wait: 10 },
      { name: "Zuhur", time: prayerSchedule.zuhur, wait: 10 },
      { name: "Asar", time: prayerSchedule.asar, wait: 10 },
      { name: "Magrib", time: prayerSchedule.magrib, wait: 7 },
      { name: "Isya", time: prayerSchedule.isya, wait: 10 }
    ];

    const nowSeconds = now.hour * 3600 + now.minute * 60 + now.second;

    for (const prayer of prayers) {
      if (!/^\d{2}:\d{2}$/.test(prayer.time || "")) continue;

      const [hour, minute] = prayer.time.split(":").map(Number);
      const startSeconds = hour * 3600 + minute * 60;
      const endSeconds = startSeconds + prayer.wait * 60;

      if (nowSeconds >= startSeconds && nowSeconds < endSeconds) {
        activePrayer = {
          name: prayer.name,
          remaining: endSeconds - nowSeconds
        };
        break;
      }
    }
  }

  if (activePrayer) {
    iqamahBanner.hidden = false;
    $("iqamahHeading").textContent =
      `WAKTU TUNGGU ${activePrayer.name.toUpperCase()}`;

    const minutes = Math.floor(activePrayer.remaining / 60);
    const seconds = activePrayer.remaining % 60;

    $("iqamahTimer").textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } else {
    iqamahBanner.hidden = true;
  }
}

async function refreshPrayerSchedule() {
  try {
    const res = await fetch("/api/prayer-schedule", {
      cache: "no-store"
    });

    if (!res.ok) return;

    const schedule = await res.json();
    prayerSchedule = schedule;

    const prayers = [
      { name: "Imsak", time: schedule.imsak },
      { name: "Subuh", time: schedule.subuh },
      { name: "Syuruq", time: schedule.syuruq },
      { name: "Duha", time: schedule.dhuha },
      { name: "Zuhur", time: schedule.zuhur },
      { name: "Asar", time: schedule.asar },
      { name: "Magrib", time: schedule.magrib },
      { name: "Isya", time: schedule.isya }
    ];

    $("tvPrayers").replaceChildren();

    prayers.forEach((p) => {
      const card = document.createElement("div");
      card.className = "prayer-card";

      const name = document.createElement("div");
      name.className = "prayer-name";
      name.textContent = p.name;

      const time = document.createElement("div");
      time.className = "prayer-time";
      time.textContent = p.time;

      card.append(name, time);
      $("tvPrayers").appendChild(card);
    });

    updateSpecialModes();
  } catch (error) {
    console.error("Gagal memuat jadwal salat:", error);
  }
}

async function refreshContent() {
  try {
    const res = await fetch("/api/content", { cache: "no-store" });
    if (!res.ok) return;

    const data = await res.json();

    setText("tvMosqueName", data.mosqueName);
    setText("tvLocation", data.location);
    setText("tvFridayDate", data.fridayDate ? data.fridayDate.split("-").reverse().join("-") : "");
    setText("tvKhatib", data.khatib);
    setText("tvImam", data.imam);
    setText("tvBilal", data.bilal);
    setText("tvWirid", data.wirid);
    setText("tvAnnouncement", data.announcement);
    setText("tvVerse", data.verse);

    if (data.updatedAt !== lastUpdated) {
      lastUpdated = data.updatedAt;
      $("updated").textContent =
        "Pembaruan: " +
        new Date(data.updatedAt).toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta"
        });
    }
  } catch {
    $("updated").textContent =
      "Koneksi lokal terputus · menampilkan data terakhir yang sudah dirender";
  }
}

ensureSpecialElements();
updateClock();
refreshContent();
refreshPrayerSchedule();
updateSpecialModes();

setInterval(updateClock, 1000);
setInterval(updateSpecialModes, 1000);
setInterval(refreshContent, 3000);
setInterval(refreshPrayerSchedule, 60000);

// FITUR BUNYI PENANDA IQAMAH
let iqamahSoundContext = null;
let iqamahSoundUnlocked = false;
let lastIqamahSignalKey = "";

document.addEventListener("pointerdown", async () => {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!iqamahSoundContext) {
      iqamahSoundContext = new AudioContextClass();
    }

    await iqamahSoundContext.resume();
    iqamahSoundUnlocked = iqamahSoundContext.state === "running";

    if (iqamahSoundUnlocked) {
      console.log("Audio iqamah aktif.");
    }
  } catch (error) {
    console.warn("Audio belum dapat diaktifkan:", error);
  }
});

function playIqamahSignal() {
  if (!iqamahSoundContext || !iqamahSoundUnlocked) {
    console.warn("Audio iqamah belum aktif.");
    return;
  }

  try {
    const ctx = iqamahSoundContext;

    for (let i = 0; i < 3; i++) {
      const mulai = ctx.currentTime + i * 0.75;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, mulai);

      gain.gain.setValueAtTime(0.0001, mulai);
      gain.gain.exponentialRampToValueAtTime(0.3, mulai + 0.04);
      gain.gain.setValueAtTime(0.3, mulai + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, mulai + 0.65);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(mulai);
      oscillator.stop(mulai + 0.66);
    }

    console.log("Bunyi penanda iqamah: 3 kali.");
  } catch (error) {
    console.error("Gagal memutar bunyi iqamah:", error);
  }
}

function checkIqamahSound() {
  if (!prayerSchedule) return;

  const now = jakartaNow();
  if (prayerSchedule.date !== now.date) return;

  const nowSeconds = now.hour * 3600 + now.minute * 60 + now.second;

  const prayers = [
    { name: "Subuh", time: prayerSchedule.subuh, wait: 10 },
    { name: "Zuhur", time: prayerSchedule.zuhur, wait: 10 },
    { name: "Asar", time: prayerSchedule.asar, wait: 10 },
    { name: "Magrib", time: prayerSchedule.magrib, wait: 7 },
    { name: "Isya", time: prayerSchedule.isya, wait: 10 }
  ];

  for (const prayer of prayers) {
    if (!/^\d{2}:\d{2}$/.test(prayer.time || "")) continue;

    const [hour, minute] = prayer.time.split(":").map(Number);
    const startSeconds = hour * 3600 + minute * 60;
    const endSeconds = startSeconds + prayer.wait * 60;
    const key = `${now.date}-${prayer.name}`;

    if (nowSeconds >= endSeconds && nowSeconds < endSeconds + 60) {
      if (lastIqamahSignalKey !== key) {
        lastIqamahSignalKey = key;
        playIqamahSignal();
      }
    }
  }
}

setInterval(checkIqamahSound, 1000);




