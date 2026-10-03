import React, { useEffect, useRef, useState } from "react";
import Watcher from "./Watcher.jsx";

export default function App() {
  const [status, setStatus] = useState("Ready");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");

  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus(
        "Speech recognition is not supported in this browser"
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listeningRef.current = true;

      setStatus("Listening...");
      setHeard("");
      setReply("");
    };

    recognition.onspeechstart = () => {
      setStatus("Hearing you...");
    };

    recognition.onspeechend = () => {
      setStatus("Processing...");
    };

    recognition.onresult = async (event) => {
      const text =
        event?.results?.[0]?.[0]?.transcript?.trim();

      if (!text) {
        setStatus("I didn't hear anything");
        return;
      }

      console.log("MAYA HEARD:", text);

      setHeard(text);
      setStatus("Thinking...");

      await askMaya(text);
    };

    recognition.onerror = (event) => {
      console.error(
        "MAYA MICROPHONE ERROR:",
        event.error
      );

      listeningRef.current = false;

      const errors = {
        "not-allowed":
          "Microphone permission denied",

        "service-not-allowed":
          "Speech service is not allowed",

        "audio-capture":
          "No microphone was detected",

        "no-speech":
          "I didn't hear you",

        "network":
          "Speech recognition network error",

        "aborted":
          "Listening stopped",

        "language-not-supported":
          "Speech language is not supported",
      };

      setStatus(
        errors[event.error] ||
          `Microphone error: ${event.error}`
      );
    };

    recognition.onend = () => {
      listeningRef.current = false;

      console.log("MAYA SPEECH RECOGNITION ENDED");

      if (status === "Listening...") {
        setStatus("Ready");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {}

      recognitionRef.current = null;
    };
  }, []);

  async function requestMicrophonePermission() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Your browser does not support microphone access."
      );
    }

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    // We only need the permission.
    // SpeechRecognition will use the microphone itself.
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  async function listen() {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setStatus(
        "Speech recognition is not supported in this browser"
      );
      return;
    }

    if (listeningRef.current) {
      return;
    }

    try {
      window.speechSynthesis?.cancel();

      setStatus("Checking microphone...");

      await requestMicrophonePermission();

      setStatus("Listening...");

      recognition.start();

    } catch (error) {
      console.error(
        "MAYA MICROPHONE START ERROR:",
        error
      );

      if (error?.name === "NotAllowedError") {
        setStatus(
          "Microphone permission denied — allow microphone access"
        );
      } else if (error?.name === "NotFoundError") {
        setStatus(
          "No microphone found"
        );
      } else if (error?.name === "NotReadableError") {
        setStatus(
          "Microphone is being used by another app"
        );
      } else {
        setStatus(
          error?.message ||
            "Could not start microphone"
        );
      }
    }
  }

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
          data?.error ||
            "Maya AI request failed"
        );
      }

      if (!data?.reply) {
        throw new Error(
          "Maya returned an empty response"
        );
      }

      setReply(data.reply);
      setStatus("Speaking...");

      speak(data.reply);

    } catch (error) {
      console.error(
        "MAYA AI ERROR:",
        error
      );

      setStatus("AI connection error");
      setReply(
        error?.message ||
          "Maya could not connect to her AI."
      );
    }
  }

  function speak(text) {
    if (!window.speechSynthesis) {
      setStatus(
        "Speech output is not supported"
      );
      return;
    }

    window.speechSynthesis.cancel();

    const voice =
      new SpeechSynthesisUtterance(text);

    voice.lang = detectLanguage(text);
    voice.rate = 0.95;
    voice.pitch = 1.05;
    voice.volume = 1;

    voice.onstart = () => {
      setStatus("Speaking...");
    };

    voice.onend = () => {
      setStatus("Ready");
    };

    voice.onerror = (event) => {
      console.error(
        "MAYA VOICE ERROR:",
        event
      );

      setStatus("Voice output error");
    };

    window.speechSynthesis.speak(voice);
  }

  function detectLanguage(text) {
    if (/[\u0980-\u09FF]/.test(text)) {
      return "bn-BD";
    }

    return "en-US";
  }

  async function testAI() {
    setHeard("Testing Maya...");
    setReply("");
    setStatus("Thinking...");

    await askMaya(
      "Say hello to me. Tell me briefly that Maya is online and her AI brain is working."
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
