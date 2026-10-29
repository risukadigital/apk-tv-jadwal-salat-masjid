const form = document.getElementById("adminForm");
const statusEl = document.getElementById("status");
const prayerNames = ["Subuh", "Zuhur", "Asar", "Magrib", "Isya"];
const prayerFields = document.getElementById("prayerFields");

prayerNames.forEach((name, i) => {
  const wrapper = document.createElement("label");
  wrapper.className = "prayer-field";
  wrapper.textContent = name;
  const input = document.createElement("input");
  input.type = "time";
  input.id = `prayer-${i}`;
  input.required = true;
  wrapper.appendChild(input);
  prayerFields.appendChild(wrapper);
});

function setValue(id, value) {
  document.getElementById(id).value = value ?? "";
}
async function loadContent() {
  try {
    const res = await fetch("/api/content");
    const data = await res.json();
    setValue("mosqueName", data.mosqueName);
    setValue("location", data.location);
    setValue("fridayDate", data.fridayDate);
    setValue("khatib", data.khatib);
    setValue("imam", data.imam);
    setValue("bilal", data.bilal);
    setValue("wirid", data.wirid);
    setValue("announcement", data.announcement);
    setValue("verse", data.verse);
    setValue("finance", data.finance);
    prayerNames.forEach((_, i) => setValue(`prayer-${i}`, data.prayerTimes?.[i]?.time || ""));
  } catch {
    statusEl.textContent = "Tidak dapat memuat data. Periksa server.";
  }
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    mosqueName: document.getElementById("mosqueName").value,
    location: document.getElementById("location").value,
    fridayDate: document.getElementById("fridayDate").value,
    khatib: document.getElementById("khatib").value,
    imam: document.getElementById("imam").value,
    bilal: document.getElementById("bilal").value,
    wirid: document.getElementById("wirid").value,
    announcement: document.getElementById("announcement").value,
    verse: document.getElementById("verse").value,
    finance: document.getElementById("finance").value,
    prayerTimes: prayerNames.map((name, i) => ({
      name, time: document.getElementById(`prayer-${i}`).value
    }))
  };
  statusEl.textContent = "Menyimpan...";
  try {
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("save failed");
    statusEl.textContent = "Tersimpan. Tampilan TV akan diperbarui.";
  } catch {
    statusEl.textContent = "Gagal menyimpan. Pastikan server aktif.";
  }
});
loadContent();
