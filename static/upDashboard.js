// ============================
// Dashboard.js (Improved Script)
// ============================

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDp5n2an6-gzKkuGPtOrA7b7FX5uw6RcE4",
  authDomain: "health-a3bc3.firebaseapp.com",
  databaseURL: "https://health-a3bc3-default-rtdb.firebaseio.com",
  projectId: "health-a3bc3",
  storageBucket: "health-a3bc3.appspot.com",
  messagingSenderId: "246933920608",
  appId: "1:246933920608:web:2f39275183ce3d6c875c05",
};

firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database().ref("SensorData");

let sensorHistory = [];
let gHistory = [];
let fallDetected = false;

function createChart(ctx, label, color) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label,
          data: [],
          borderColor: color,
          backgroundColor: `${color}33`,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: { display: true },
        y: { display: true },
      },
      plugins: {
        legend: {
          labels: {
            font: { weight: "bold" },
          },
        },
      },
    },
  });
}

const charts = {
  accelX: createChart(
    document.getElementById("accelXChart").getContext("2d"),
    "AccelX",
    "#3B82F6"
  ),
  accelY: createChart(
    document.getElementById("accelYChart").getContext("2d"),
    "AccelY",
    "#10B981"
  ),
  accelZ: createChart(
    document.getElementById("accelZChart").getContext("2d"),
    "AccelZ",
    "#F59E0B"
  ),
  temp: createChart(
    document.getElementById("tempChart").getContext("2d"),
    "Temperature",
    "#EF4444"
  ),
};

dbRef.on("value", (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const timestamp = new Date().toLocaleString();
  document.getElementById("timestamp").innerText = "Last Updated: " + timestamp;

  document.getElementById(
    "accelXBox"
  ).innerText = `AccelX: ${data.AccelX.toFixed(3)}`;
  document.getElementById(
    "accelYBox"
  ).innerText = `AccelY: ${data.AccelY.toFixed(3)}`;
  document.getElementById(
    "accelZBox"
  ).innerText = `AccelZ: ${data.AccelZ.toFixed(3)}`;
  document.getElementById("tempBox").innerText = `Temperature: ${(
    data.Temperature * 1
  ).toFixed(1)} °C`;

  sensorHistory.push({ timestamp, ...data });

  updateChart(charts.accelX, data.AccelX);
  updateChart(charts.accelY, data.AccelY);
  updateChart(charts.accelZ, data.AccelZ);
  updateChart(charts.temp, data.Temperature);

  detectFall(data.AccelX, data.AccelY, data.AccelZ);
});

function updateChart(chart, value) {
  const time = new Date().toLocaleTimeString();
  if (chart.data.labels.length > 25) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(value);
  chart.update();
}

function detectFall(x, y, z) {
  const g = Math.sqrt(x * x + y * y + z * z);
  gHistory.push(g);
  if (gHistory.length > 5) gHistory.shift();

  const lowerThreshold = 7.0;
  const upperThreshold = 11.5;

  if (
    !fallDetected &&
    gHistory[0] < lowerThreshold &&
    gHistory.some((val) => val > upperThreshold)
  ) {
    fallDetected = true;
    showFallAlert();
    setTimeout(() => (fallDetected = false), 5000);
  }
}

function showFallAlert() {
  const alertBox = document.getElementById("fallAlert");
  alertBox.classList.remove("hidden");

  ["accelXBox", "accelYBox", "accelZBox"].forEach((id) => {
    document
      .getElementById(id)
      .classList.add("animate-pulse", "ring", "ring-red-400");
  });

  const li = document.createElement("li");
  li.innerText = "Fall detected at " + new Date().toLocaleString();
  document.getElementById("fallHistoryList").prepend(li);

  setTimeout(() => {
    alertBox.classList.add("hidden");
    ["accelXBox", "accelYBox", "accelZBox"].forEach((id) => {
      document
        .getElementById(id)
        .classList.remove("animate-pulse", "ring", "ring-red-400");
    });
  }, 10000);
}

function downloadHistory() {
  if (!sensorHistory.length) return alert("No history to download.");

  const csv = [["Timestamp", "AccelX", "AccelY", "AccelZ", "Temperature"]];
  sensorHistory.forEach((e) => {
    csv.push([e.timestamp, e.AccelX, e.AccelY, e.AccelZ, e.Temperature]);
  });

  const blob = new Blob([csv.map((r) => r.join(",")).join("\n")], {
    type: "text/csv",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "sensor_history.csv";
  link.click();
}
