/* =========================================================
   VOICECHECK JAVASCRIPT
   ========================================================= */

let currentPage = "home";

let mediaStream = null;
let mediaRecorder = null;
let audioChunks = [];

let audioContext = null;
let analyser = null;
let sourceNode = null;
let animationFrame = null;

let recordingTimer = null;
let recordingSeconds = 5;

let recordedAudioURL = null;

/* =========================================================
   PAGE NAVIGATION
   ========================================================= */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const target = document.getElementById(pageId);

  if (target) {
    target.classList.add("active");
    currentPage = pageId;
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "results") {
    animateMetrics();
  }
}

/* =========================================================
   START VOICE CHECK
   ========================================================= */
function startVoiceCheck() {
  showPage("voice");
  resetVoiceInterface();

  document.getElementById("voiceIntro").style.display = "block";
  document.getElementById("micStep").style.display = "none";
  document.getElementById("recordStep").style.display = "none";
  document.getElementById("playbackStep").style.display = "none";
  document.getElementById("processingStep").style.display = "none";

  updateSteps(1);
}

/* =========================================================
   RESET
   ========================================================= */
function resetVoiceInterface() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }

  mediaRecorder = null;
  audioChunks = [];
  recordingSeconds = 5;

  const timer = document.getElementById("timer");
  if (timer) timer.textContent = "0:05";

  const recordButton = document.getElementById("recordButton");
  if (recordButton) recordButton.classList.remove("recording");

  const buttonText = document.getElementById("recordButtonText");
  if (buttonText) buttonText.textContent = "START";

  const state = document.getElementById("recordState");
  if (state) state.textContent = "Ready to record";
}

function resetVoiceCheck() {
  resetVoiceInterface();

  document.getElementById("voiceIntro").style.display = "block";
  document.getElementById("micStep").style.display = "none";
  document.getElementById("recordStep").style.display = "none";
  document.getElementById("playbackStep").style.display = "none";
  document.getElementById("processingStep").style.display = "none";

  updateSteps(1);
}

/* =========================================================
   STEP INDICATOR
   ========================================================= */
function updateSteps(step) {
  const lines = [
    document.getElementById("stepLine1"),
    document.getElementById("stepLine2"),
    document.getElementById("stepLine3")
  ];

  lines.forEach((line, index) => {
    line.classList.remove("done", "current");
    if (index + 1 < step) line.classList.add("done");
    if (index + 1 === step) line.classList.add("current");
  });
}

/* =========================================================
   MICROPHONE
   ========================================================= */
async function requestMicrophone(showMicOnly = false) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast("Your browser does not support microphone recording.");
    return;
  }

  try {
    if (!showMicOnly) {
      document.getElementById("voiceIntro").style.display = "none";
      document.getElementById("micStep").style.display = "block";
      updateSteps(1);
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    document.getElementById("micStatus").textContent = "Microphone connected successfully ✓";
    showToast("Microphone connected successfully.");

    setTimeout(() => {
      showRecordingScreen();
    }, 700);

  } catch (error) {
    console.error(error);
    document.getElementById("micStatus").textContent = "Microphone permission was not granted.";
    showToast("Please allow microphone access in your browser.");
  }
}

/* =========================================================
   RECORDING SCREEN
   ========================================================= */
function showRecordingScreen() {
  document.getElementById("voiceIntro").style.display = "none";
  document.getElementById("micStep").style.display = "none";
  document.getElementById("recordStep").style.display = "block";
  document.getElementById("playbackStep").style.display = "none";
  document.getElementById("processingStep").style.display = "none";

  updateSteps(2);
  setupAudioVisualizer();
}

/* =========================================================
   AUDIO VISUALIZER
   ========================================================= */
function setupAudioVisualizer() {
  const canvas = document.getElementById("recordCanvas");
  const ctx = canvas.getContext("2d");

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  resizeCanvas();

  if (!mediaStream) return;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    sourceNode = audioContext.createMediaStreamSource(mediaStream);
    sourceNode.connect(analyser);
  } catch (error) {
    console.error("Visualizer error:", error);
    return;
  }

  drawVisualizer();
}

function drawVisualizer() {
  const canvas = document.getElementById("recordCanvas");
  if (!canvas || !analyser) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const dataArray = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(dataArray);

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(7,155,131,.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 45) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(7,155,131,.13)";
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#079b83";

  const sliceWidth = width / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const value = dataArray[i] / 128.0;
    const y = (value * height) / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.stroke();
  animationFrame = requestAnimationFrame(drawVisualizer);
}

/* =========================================================
   START / STOP RECORDING
   ========================================================= */
function toggleRecording() {
  if (!mediaStream) {
    showToast("Please allow microphone access first.");
    return;
  }

  if (mediaRecorder && mediaRecorder.state === "recording") {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  audioChunks = [];
  recordingSeconds = 5;

  document.getElementById("timer").textContent = "0:05";

  let mimeType = "";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    mimeType = "audio/webm;codecs=opus";
  } else if (MediaRecorder.isTypeSupported("audio/webm")) {
    mimeType = "audio/webm";
  }

  try {
    mediaRecorder = mimeType
      ? new MediaRecorder(mediaStream, { mimeType })
      : new MediaRecorder(mediaStream);
  } catch (error) {
    showToast("Could not start audio recorder.");
    return;
  }

  mediaRecorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = finishRecording;
  mediaRecorder.start(100);

  document.getElementById("recordButton").classList.add("recording");
  document.getElementById("recordButtonText").textContent = "STOP";
  document.getElementById("recordState").textContent = "Recording your voice…";

  let remaining = 5;
  recordingTimer = setInterval(() => {
    remaining--;
    document.getElementById("timer").textContent = `0:0${remaining}`;

    if (remaining <= 0) {
      clearInterval(recordingTimer);
      recordingTimer = null;
      stopRecording();
    }
  }, 1000);
}

function stopRecording() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  document.getElementById("recordButton").classList.remove("recording");
  document.getElementById("recordButtonText").textContent = "DONE";
  document.getElementById("recordState").textContent = "Preparing your sample…";
}

/* =========================================================
   FINISH RECORDING
   ========================================================= */
function finishRecording() {
  const mime = mediaRecorder.mimeType || "audio/webm";
  const audioBlob = new Blob(audioChunks, { type: mime });

  if (recordedAudioURL) {
    URL.revokeObjectURL(recordedAudioURL);
  }

  recordedAudioURL = URL.createObjectURL(audioBlob);

  const player = document.getElementById("audioPlayback");
  player.src = recordedAudioURL;
  player.load();

  setTimeout(() => {
    document.getElementById("recordStep").style.display = "none";
    document.getElementById("playbackStep").style.display = "block";
    updateSteps(3);
  }, 700);

  showToast("Recording completed successfully.");
}

/* =========================================================
   ANALYSIS
   ========================================================= */
function startAnalysis() {
  document.getElementById("playbackStep").style.display = "none";
  document.getElementById("processingStep").style.display = "block";

  for (let i = 1; i <= 4; i++) {
    const icon = document.getElementById("analysisIcon" + i);
    icon.className = "analysis-status";
    icon.textContent = "✓";
  }

  processAnalysisStep(1, 900);
}

function processAnalysisStep(step, delay) {
  if (step > 4) {
    // When connecting your actual backend, call fetch() here instead of the setTimeout mock
    setTimeout(() => {
      showResults();
    }, 700);
    return;
  }

  const icon = document.getElementById("analysisIcon" + step);
  icon.className = "analysis-status loading";

  setTimeout(() => {
    icon.className = "analysis-status complete";
    icon.textContent = "✓";
    processAnalysisStep(step + 1, 900);
  }, delay);
}

/* =========================================================
   RESULTS
   ========================================================= */
function showResults() {
  // Mock Data (Replace this block with your actual JSON response later)
  const results = {
      fluency_score: 85,
      voice_stability: 78,
      signal_quality: 91,
      risk_score: 18,
      status: "Lower-risk pattern"
  };

  // Update the UI with safe medical phrasing
  const riskTitle = document.getElementById("riskTitle");
  riskTitle.textContent = results.status;
  
  if (results.risk_score > 50) {
      riskTitle.style.color = "#d24e72"; // Alert color for higher risk
  } else {
      riskTitle.style.color = "#087f6d"; // Calm color for lower risk
  }

  document.getElementById("riskScoreVal").textContent = `${results.risk_score} / 100`;
  
  // Position the marker on the gradient bar based on risk score percentage
  document.getElementById("riskMarker").style.left = `${results.risk_score}%`;

  document.getElementById("fluencyVal").textContent = `${results.fluency_score} / 100`;
  document.getElementById("fluencyFill").dataset.width = `${results.fluency_score}%`;

  document.getElementById("stabilityVal").textContent = `${results.voice_stability} / 100`;
  document.getElementById("stabilityFill").dataset.width = `${results.voice_stability}%`;

  document.getElementById("qualityVal").textContent = `${results.signal_quality} / 100`;
  document.getElementById("qualityFill").dataset.width = `${results.signal_quality}%`;

  showPage("results");
  animateMetrics();
}

function animateMetrics() {
  setTimeout(() => {
    document.querySelectorAll(".metric-fill").forEach(fill => {
      fill.style.width = fill.dataset.width;
    });
  }, 250);
}

/* =========================================================
   RECORD ANOTHER
   ========================================================= */
function recordAnother() {
  resetVoiceInterface();
  showPage("voice");

  document.getElementById("voiceIntro").style.display = "none";
  document.getElementById("micStep").style.display = "block";
  document.getElementById("recordStep").style.display = "none";
  document.getElementById("playbackStep").style.display = "none";
  document.getElementById("processingStep").style.display = "none";

  updateSteps(1);
}

/* =========================================================
   TOAST
   ========================================================= */
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/* =========================================================
   CLEANUP
   ========================================================= */
window.addEventListener("beforeunload", () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }

  if (recordedAudioURL) {
    URL.revokeObjectURL(recordedAudioURL);
  }
});

/* =========================================================
   INITIALIZATION
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  showPage("home");
});