import React, { useEffect, useRef, useState } from "react";
import Watcher from "./Watcher.jsx";

export default function App() {
  const [status, setStatus] = useState("Ready");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus("Listening...");
      setHeard("");
      setReply("");
    };

    recognition.onresult = async (event) => {
      const text =
        event.results[0][0].transcript.trim();

      console.log("MAYA HEARD:", text);

      setHeard(text);
      setStatus("Heard. Thinking...");

      await askMaya(text);
    };

    recognition.onerror = (event) => {
      console.error("MIC ERROR:", event.error);

      setStatus(`Microphone error: ${event.error}`);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []);

  async function askMaya(text) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      console.log("MAYA API:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "API request failed"
        );
      }

      setReply(data.reply);
      setStatus("Speaking...");

      speak(data.reply);
    } catch (error) {
      console.error("MAYA ERROR:", error);

      setStatus("AI connection error");

      setReply(error.message);
    }
  }

  function speak(text) {
    if (!window.speechSynthesis) {
      setStatus("Speech output unavailable");
      return;
    }

    window.speechSynthesis.cancel();

    const voice = new SpeechSynthesisUtterance(text);

    voice.lang = detectLanguage(text);
    voice.rate = 0.95;
    voice.pitch = 1.05;
    voice.volume = 1;

    voice.onend = () => {
      setStatus("Ready");
    };

    voice.onerror = () => {
      setStatus("Voice output error");
    };

    window.speechSynthesis.speak(voice);
  }

  function detectLanguage(text) {
    return /[\u0980-\u09FF]/.test(text)
      ? "bn-BD"
      : "en-US";
  }

  function listen() {
    if (!recognitionRef.current) {
      setStatus("Microphone unavailable");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      recognitionRef.current.start();
    } catch (error) {
      console.error(error);
    }
  }

  async function testAI() {
    setHeard("Testing Maya...");
    setStatus("Thinking...");

    await askMaya(
      "Say hello to me and tell me that your AI brain is working."
    );
  }

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

        {heard && (
          <div className="maya-message">
            <strong>You:</strong> {heard}
          </div>
        )}

        {reply && (
          <div className="maya-message">
            <strong>Maya:</strong> {reply}
          </div>
        )}

        <div className="maya-controls">

          <button
            className="maya-button"
            onClick={listen}
          >
            🎙 Listen
          </button>

          <button
            className="maya-button"
            onClick={testAI}
          >
            ✦ Test AI
          </button>

        </div>

      </section>
    </main>
  );
}
