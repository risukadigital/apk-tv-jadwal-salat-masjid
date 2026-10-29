const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "content.json");

const defaultContent = {
  mosqueName: "Masjid Kita",
  location: "Alamat / lokasi masjid",
 
  fridayDate: "",
  khatib: "Nama khatib Jumat",
  imam: "",
  bilal: "",
  wirid: "Jadwal wirid: isi melalui panel admin",
  announcement: "Selamat datang di masjid",
  verse: "Masukkan ayat atau hadis pilihan di panel admin",
  finance: "Ringkasan keuangan: belum diisi",
  updatedAt: new Date().toISOString()
};

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultContent, null, 2), "utf8");
  }
}
function readContent() {
  ensureData();
  try {
    return { ...defaultContent, ...JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) };
  } catch {
    return { ...defaultContent };
  }
}
function writeContent(content) {
  ensureData();
  const safe = {
    mosqueName: String(content.mosqueName || "Masjid Kita").slice(0, 120),
    location: String(content.location || "").slice(0, 200),
    prayerTimes: Array.isArray(content.prayerTimes)
      ? content.prayerTimes.slice(0, 5).map((p, i) => ({
          name: String(p.name || defaultContent.prayerTimes[i]?.name || "Salat").slice(0, 30),
          time: String(p.time || "--:--").slice(0, 5)
        }))
      : defaultContent.prayerTimes,
    fridayDate: /^\d{4}-\d{2}-\d{2}$/.test(String(content.fridayDate || "")) ? String(content.fridayDate) : "",
    khatib: String(content.khatib || "").slice(0, 200),
    imam: String(content.imam || "").slice(0, 200),
    bilal: String(content.bilal || "").slice(0, 200),
    wirid: String(content.wirid || "").slice(0, 500),
    announcement: String(content.announcement || "").slice(0, 500),
    verse: String(content.verse || "").slice(0, 700),
    finance: String(content.finance || "").slice(0, 500),
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(safe, null, 2), "utf8");
  return safe;
}

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/admin", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/tv", (_req, res) => {
   res.sendFile(path.join(__dirname, "public", "tv.html"));
});
app.get("/", (_req, res) => res.redirect("/admin"));
app.get("/api/content", (_req, res) => res.json(readContent()));
const PRAYER_SCHEDULE_FILE = path.join(
  DATA_DIR,
  "jadwal-dharmasraya-2026.json"
);

app.get("/api/prayer-schedule", (_req, res) => {
  try {
    const schedule = JSON.parse(
      fs.readFileSync(PRAYER_SCHEDULE_FILE, "utf8")
    );

   const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).formatToParts(new Date());

const today =
  `${parts.find(p => p.type === "year").value}-` +
  `${parts.find(p => p.type === "month").value}-` +
  `${parts.find(p => p.type === "day").value}`;

    const day = schedule.days.find(row => row[0] === today);

    if (!day) {
      return res.status(404).json({
        error: "Jadwal untuk tanggal ini tidak ditemukan."
      });
    }

    res.json({
  date: day[0],
  imsak: day[1],
  subuh: day[2],
  syuruq: day[3],
  dhuha: day[4],
  zuhur: day[5],
  asar: day[6],
  magrib: day[7],
  isya: day[8]
});
  } catch (error) {
    res.status(500).json({
      error: "Gagal membaca file jadwal tahunan."
    });
  }
});
app.put("/api/content", (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Data tidak valid." });
  }
  const updated = writeContent(req.body);
  res.json({ ok: true, content: updated });
});
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Aplikasi berjalan: http://localhost:${PORT}`);
  console.log(`Panel admin: http://localhost:${PORT}/admin`);
  console.log(`Tampilan TV: http://localhost:${PORT}/tv`);
  const nets = os.networkInterfaces();
  for (const list of Object.values(nets)) {
    for (const net of (list || [])) {
      if (net.family === "IPv4" && !net.internal) {
        console.log(`Akses dari perangkat lain: http://${net.address}:${PORT}`);
      }
    }
  }
  console.log("Catatan: server ini harus berjalan pada perangkat yang dapat menjalankan Node.js.");
});


