import React, { useEffect, useRef, useState } from "react";
import Watcher from "./Watcher.jsx";

export default function App() {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Ready");

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("Voice unavailable");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      setStatus("Listening...");
    };

    recognition.onend = () => {
      setListening(false);
      setStatus("Ready");
    };

    recognition.onerror = () => {
      setListening(false);
      setStatus("Voice error");
    };

    recognition.onresult = (event) => {
      const text =
        event.results[0][0].transcript;

      setMessage(text);
      setStatus("Heard");
    };

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
    } catch {}
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    window.speechSynthesis.speak(utterance);
  };

  const testMaya = () => {
    const reply =
      "Hello. I am Maya. I am ready.";

    setMessage(reply);
    setStatus("Speaking");

    speak(reply);

    setTimeout(() => {
      setStatus("Ready");
    }, 2500);
  };

  return (
    <main className="maya-app">
      <section className="maya-center">

        <Watcher
          size={300}
          follow={70}
          bounce={30}
        />

        <div className="maya-name">
          <span className="maya-dot" />
          MAYA
        </div>

        <div className="maya-subtitle">
          PERSONAL AI ASSISTANT
        </div>

        <div className="maya-status">
          {status}
        </div>

        {message && (
          <div className="maya-message">
            {message}
          </div>
        )}

        <div className="maya-controls">

          <button
            className="maya-button"
            onClick={startListening}
          >
            🎙 Talk
          </button>

          <button
            className="maya-button"
            onClick={testMaya}
          >
            ✦ Test Maya
          </button>

        </div>

      </section>
    </main>
  );
}
