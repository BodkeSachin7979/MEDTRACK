const BLYNK_TOKEN = "nG_KCiaywr9TSYguuBNEvTyUy6v_r62y";
const pinMap = { bpm: "v1", spo2: "v2" };

const bpmChart = new Chart(document.getElementById("blynkBPMChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "BPM",
        data: [],
        borderColor: "green",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#14532d" },
      },
      x: {
        ticks: { color: "#14532d" },
      },
    },
  },
});

const spo2Chart = new Chart(document.getElementById("blynkSpO2Chart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "SpO2",
        data: [],
        borderColor: "teal",
        backgroundColor: "rgba(13, 148, 136, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#134e4a" },
      },
      x: {
        ticks: { color: "#134e4a" },
      },
    },
  },
});

async function fetchBlynkData(pin) {
  const url = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}&pin=${pin}`;
  const res = await fetch(url);
  return parseFloat(await res.text());
}

async function updateDashboardFromBlynk() {
  const bpm = await fetchBlynkData(pinMap.bpm);
  const spo2 = await fetchBlynkData(pinMap.spo2);
  const time = new Date().toLocaleTimeString();

  document.getElementById("bpmBox").innerText = `BPM: ${bpm.toFixed(2)}`;
  document.getElementById("spo2Box").innerText = `SpO2: ${spo2.toFixed(2)}`;

  if (bpmChart.data.labels.length >= 20) {
    bpmChart.data.labels.shift();
    bpmChart.data.datasets[0].data.shift();
  }

  if (spo2Chart.data.labels.length >= 20) {
    spo2Chart.data.labels.shift();
    spo2Chart.data.datasets[0].data.shift();
  }

  bpmChart.data.labels.push(time);
  bpmChart.data.datasets[0].data.push(bpm);
  bpmChart.update();

  spo2Chart.data.labels.push(time);
  spo2Chart.data.datasets[0].data.push(spo2);
  spo2Chart.update();
}

// Auto-update every 5 seconds
setInterval(updateDashboardFromBlynk, 5000);
