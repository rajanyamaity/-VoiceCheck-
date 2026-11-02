# VoiceCheck – Digital Voice Biomarker Research

**A browser-based voice recording and analysis research demo.**

🔗 **Live Demo:** [https://parkinsonvoice.netlify.app/](https://parkinsonvoice.netlify.app/)

## About the Project

VoiceCheck is a web-based research demonstration designed to explore voice recording and visualisation for digital voice biomarker research, with a focus on Parkinson's-related voice analysis.

The application allows users to record a short voice sample, visualise the audio waveform, listen to their recording, and view a demonstration analysis report.

**Note:** This is a research demo, not a medically validated diagnostic tool.

## Features

- Record a 5-second voice sample using a microphone.
- Real-time audio waveform visualisation.
- Playback of recorded audio.
- Audio recording quality indicators.
- Analysis progress and results interface.
- Responsive user interface.

## Live Demo

Try the application here:

👉 https://parkinsonvoice.netlify.app/

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Web Audio API
- MediaRecorder API
- Canvas API
- Browser Microphone API (`getUserMedia`)

## How It Works

1. Open the VoiceCheck application.
2. Allow microphone access.
3. Record a steady "Aah" sound for approximately 5 seconds.
4. View the audio waveform.
5. Play back your recording.
6. Proceed to the demonstration analysis screen.
7. View the sample analysis metrics.

## Project Structure

```text
VoiceCheck/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/VoiceCheck.git
```

### 2. Navigate to the Project Folder

```bash
cd VoiceCheck
```

### 3. Run the Project

Open the project in VS Code and use the Live Server extension to run `index.html`.

**Note:** Microphone access generally requires HTTPS or localhost.

## Current Implementation Status

| Component | Status |
|---|---|
| User interface | Implemented |
| Voice recording | Implemented |
| Waveform visualisation | Implemented |
| Audio playback | Implemented |
| Analysis results interface | Implemented |
| Analysis metrics | Simulated demo values |
| Trained ML model | Not integrated yet |
| Backend integration | Not implemented yet |

## Future Improvements

- Integrate a trained machine learning model for voice analysis.
- Extract acoustic features such as pitch, jitter, shimmer, and voice stability.
- Develop a backend for audio processing.
- Improve recording quality assessment.
- Conduct research and validation using appropriate datasets.
- Add privacy-focused, consent-based audio handling.

## Medical Disclaimer

VoiceCheck is currently an experimental research demonstration. The displayed analysis values are simulated and must not be interpreted as actual Parkinson's disease risk scores or medical diagnoses.

This application is not intended to replace professional medical evaluation.

## Author

**Rajanya Maity**

B.Tech – Information Technology

- GitHub: https://github.com/rajanyamaity
- LinkedIn: https://www.linkedin.com/in/rajanyamaity/

---

If you find this project interesting, consider giving the repository a ⭐ on GitHub!
