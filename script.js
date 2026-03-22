// 🎤 Voice Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

// 🔊 Speak function
function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
}

// 🌡️ Sensors (SIMULATED)
function getTemperature() { return (20 + Math.random() * 15).toFixed(2); }
function getMoisture() { return (10 + Math.random() * 70).toFixed(2); }
function getHumidity() { return (40 + Math.random() * 50).toFixed(2); }
function getLight() { return (200 + Math.random() * 800).toFixed(2); }
function getRain() { return Math.random() > 0.5 ? "Raining" : "No rain"; }

// 💧 Irrigation
function irrigationDecision(moisture, temp, rain) {
    if (rain === "Raining") return "It is raining. No irrigation needed.";
    else if (moisture < 30 && temp > 30) return "High irrigation needed.";
    else if (moisture < 30) return "Irrigation needed.";
    else return "No irrigation needed.";
}

// 📊 Graph Setup
let tempData=[], moistureData=[], humidityData=[], lightData=[], rainData=[], labels=[];
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            { label: 'Temp', data: tempData },
            { label: 'Moisture', data: moistureData },
            { label: 'Humidity', data: humidityData },
            { label: 'Light/10', data: lightData },
            { label: 'Rain', data: rainData }
        ]
    }
});

// 📈 Update Graph
function updateGraph(temp, moisture, humidity, light, rain) {
    let time = new Date().toLocaleTimeString();
    labels.push(time);
    tempData.push(temp);
    moistureData.push(moisture);
    humidityData.push(humidity);
    lightData.push(light/10);
    rainData.push(rain === "Raining" ? 1 : 0);
    if(labels.length > 10){
        labels.shift();
        tempData.shift();
        moistureData.shift();
        humidityData.shift();
        lightData.shift();
        rainData.shift();
    }
    myChart.update();
}

// 📝 Log data // ADDED
let sensorLog = [];
function logData(temp, moisture, humidity, light, rain) {
    let time = new Date().toLocaleTimeString();
    sensorLog.push({ time, temp, moisture, humidity, light, rain });
    console.log("Log:", sensorLog);
}

// ⏱️ Monitoring Control
let intervalId = null;
function startMonitoring() {
    if(intervalId !== null) return;
    intervalId = setInterval(() => {
        let temp = getTemperature();
        let moisture = getMoisture();
        let humidity = getHumidity();
        let light = getLight();
        let rain = getRain();
        updateGraph(temp, moisture, humidity, light, rain);
        logData(temp, moisture, humidity, light, rain); // ADDED
        // Update UI
        document.getElementById("temp").innerText = temp;
        document.getElementById("moisture").innerText = moisture;
        document.getElementById("humidity").innerText = humidity;
        document.getElementById("light").innerText = light;
        document.getElementById("rain").innerText = rain;
        // Alerts
        document.getElementById("tempCard").className = "card " + (temp > 35 ? "danger" : "safe");
        if(moisture < 20) document.getElementById("moistureCard").className = "card danger";
        else if(moisture < 40) document.getElementById("moistureCard").className = "card warning";
        else document.getElementById("moistureCard").className = "card safe";
    }, 5000);
    speak("Monitoring started");
}

function stopMonitoring() {
    clearInterval(intervalId);
    intervalId = null;
    speak("Monitoring stopped");
}

// 🎤 Voice Start
function startListening() {
    recognition.start();
}

// 🎯 Commands
recognition.onresult = function(event) {
    let command = event.results[0][0].transcript.toLowerCase();
    let temp = getTemperature();
    let moisture = getMoisture();
    let rain = getRain();
    let humidity = getHumidity();
    let light = getLight();
    let response = "";

    if(command.includes("start monitoring")) {
        startMonitoring();
        return;
    } else if(command.includes("stop monitoring")) { // ADDED FIX
        stopMonitoring();
        return;
    } else if(command.includes("temperature")) {
        response = `Temperature is ${temp}`;
    } else if(command.includes("moisture")) {
        response = `Moisture is ${moisture}`;
    } else if(command.includes("humidity")) {
        response = `Humidity is ${humidity}`;
    } else if(command.includes("light")) {
        response = `Light is ${light}`;
    } else if(command.includes("water")) {
        response = irrigationDecision(moisture, temp, rain);
    } else if(command.includes("weather")) {
        response = rain;
    } else {
        response = "Command not understood";
    }
    document.getElementById("output").innerText = response;
    speak(response);
};

// 🔊 Welcome
window.onload = () => {
    speak("System ready. Say start monitoring.");
};
function showData() {
    let dataHtml = "<table border='1'><tr><th>Time</th><th>Temp</th><th>Moisture</th><th>Humidity</th><th>Light</th><th>Rain</th></tr>";
    sensorLog.forEach(log => {
        dataHtml += `<tr><td>${log.time}</td><td>${log.temp}</td><td>${log.moisture}</td><td>${log.humidity}</td><td>${log.light}</td><td>${log.rain}</td></tr>`;
    });
    dataHtml += "</table>";
    document.getElementById("dataDisplay").innerHTML = dataHtml;
}