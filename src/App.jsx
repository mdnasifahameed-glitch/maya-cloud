import React, { useEffect, useRef, useState } from "react";
import Watcher from "./Watcher.jsx";

export default function App() {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
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

      if (status === "Listening...") {
        setStatus("Processing...");
      }
    };

    recognition.onerror = (event) => {
      console.error(event);
      setListening(false);
      setStatus("Voice error");
    };

    recognition.onresult = async (event) => {
      const text =
        event.results[0][0].transcript.trim();

      setMessage(text);
      setStatus("Thinking...");

      await askMaya(text);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
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

      if (!response.ok) {
        throw new Error(
          data.error || "Maya could not respond"
        );
      }

      const mayaReply = data.reply;

      setReply(mayaReply);
      setStatus("Speaking...");

      speak(mayaReply);
    } catch (error) {
      console.error(error);

      setReply(
        "I'm having trouble connecting to my AI brain."
      );

      setStatus("Connection error");
    }
  }

  function speak(text) {
    if (!window.speechSynthesis) {
      setStatus("Speech unavailable");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = detectLanguage(text);

    utterance.rate = 0.94;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    utterance.onend = () => {
      setStatus("Ready");
    };

    utterance.onerror = () => {
      setStatus("Speech error");
    };

    window.speechSynthesis.speak(utterance);
  }

  function detectLanguage(text) {
    const bangla = /[\u0980-\u09FF]/;

    return bangla.test(text)
      ? "bn-BD"
      : "en-US";
  }

  function startListening() {
    if (!recognitionRef.current) return;

    window.speechSynthesis.cancel();

    setMessage("");
    setReply("");

    try {
      recognitionRef.current.start();
    } catch {}
  }

  async function testMaya() {
    setMessage("Hello Maya");
    setStatus("Thinking...");

    await askMaya(
      "Introduce yourself briefly and tell me that you are ready to help me."
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

        {message && (
          <div className="maya-message">
            <strong>You:</strong> {message}
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
            onClick={startListening}
            disabled={listening}
          >
            {listening ? "🎙 Listening..." : "🎙 Talk"}
          </button>

          <button
            className="maya-button"
            onClick={testMaya}
          >
            ✦ Ask Maya
          </button>

        </div>

      </section>
    </main>
  );
}
