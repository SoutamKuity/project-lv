import { useState, useEffect } from "react";
import { Heart, Sparkles, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingHearts from "@/components/FloatingHearts";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import NameInput from "@/components/NameInput";
import QuestionCard from "@/components/QuestionCard";
import CompatibilityResult from "@/components/CompatibilityResult";
import { loveQuestions } from "@/data/questions";
import axios from "axios";

const url = "http://localhost:5000/api"

// const url="http://localhost:5000/api"


type GameState = "landing" | "qr-display" | "name-input" | "questions" | "waiting" | "results";

interface Partner {
  name: string;
  answers: string[];
}

const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

const calculateCompatibility = (answers1: string[], answers2: string[]): number => {
  if (answers1.length === 0 || answers2.length === 0) return 0;
  const matches = answers1.filter((answer, index) => answer === answers2[index]).length;
  const baseScore = Math.round((matches / answers1.length) * 100);
  // Add some variance to make it more interesting
  const variance = Math.floor(Math.random() * 15) - 5;
  return Math.max(20, Math.min(100, baseScore + variance));
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("landing");
  const [sessionId, setSessionId] = useState("");
  const [scannedCount, setScannedCount] = useState(0);
  const [currentPartner, setCurrentPartner] = useState<1 | 2>(1);

  const [partner1, setPartner1] = useState<Partner>({
    name: "",
    answers: [],
  });
  const [partner2, setPartner2] = useState<Partner>({
    name: "",
    answers: [],
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [compatibilityScore, setCompatibilityScore] = useState(0);

  /* ---------------- QR SCAN ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");

    if (!session) return;

    axios
      .get(`${url}/session/${session}`)
      .then((res) => {
        if (res.data.state === "full") {
          alert("This session already has two participants");
          return;
        }

        setSessionId(session);
        setCurrentPartner(res.data.partner);
        setScannedCount(res.data.partner); // 1 or 2
        setGameState("name-input");
      })
      .catch(() => {
        alert("Invalid or expired session");
      });

    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  /* ---------------- CREATE SESSION ---------------- */
  const startNewSession = async () => {
    const newSessionId = generateSessionId();

    try {
      await axios.post(`${url}/session/create`, {
        sessionId: newSessionId,
      });

      setSessionId(newSessionId);
      setScannedCount(0);
      setCurrentQuestionIndex(0);
      setGameState("qr-display");
    } catch {
      alert("Failed to create session");
    }
  };

  useEffect(() => {
    if (gameState !== "qr-display") return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${url}/session/${sessionId}/getpartners`);

        if (res.data.scannedCount >= 2) {
          setScannedCount(2);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("QR polling failed");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gameState, sessionId]);

  /* ---------------- SAVE NAME ---------------- */
  const handleNameSubmit = async (name: string) => {
    try {
      await axios.post(`${url}/session/${sessionId}/name`, {
        partner: currentPartner,
        name,
      });

      if (currentPartner === 1) {
        setPartner1((prev) => ({ ...prev, name }));
      } else {
        setPartner2((prev) => ({ ...prev, name }));
      }

      setCurrentQuestionIndex(0);
      setGameState("questions");
    } catch {
      alert("Failed to save name");
    }
  };

  /* ---------------- SAVE ANSWER ---------------- */
  const handleAnswer = async (answer: string) => {
    try {
      await axios.post(`${url}/session/${sessionId}/answer`, {
        partner: currentPartner,
        answer,
      });

      if (currentPartner === 1) {
        setPartner1((prev) => ({
          ...prev,
          answers: [...prev.answers, answer],
        }));
      } else {
        setPartner2((prev) => ({
          ...prev,
          answers: [...prev.answers, answer],
        }));
      }

      if (currentQuestionIndex < loveQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setGameState("waiting");
      }
    } catch {
      alert("Failed to save answer");
    }
  };

  /* ---------------- RESULT POLLING ---------------- */
  useEffect(() => {
    if (gameState !== "waiting") return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${url}/session/${sessionId}/result`
        );

        if (res.data.ready) {
          console.log("Result ready:", res.data);

          setCompatibilityScore(res.data.score);

          // ✅ store names
          setPartner1((prev) => ({
            ...prev,
            name: res.data.partner1,
            answers: res.data.partner1Answers,
          }));

          setPartner2((prev) => ({
            ...prev,
            name: res.data.partner2,
            answers: res.data.partner2Answers,
          }));

          setGameState("results");
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error fetching result");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gameState, sessionId]);


  /* ---------------- RESET ---------------- */
  const handleNewSession = () => {
    setGameState("landing");
    setSessionId("");
    setScannedCount(0);
    setCurrentQuestionIndex(0);
    setCompatibilityScore(0);
    setPartner1({ name: "", answers: [] });
    setPartner2({ name: "", answers: [] });
  };

  return (
    <div className="min-h-screen gradient-soft relative overflow-hidden">
      <FloatingHearts />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-primary fill-primary animate-heartbeat" />
            <h1 className="font-display text-3xl md:text-4xl text-gradient">
              Love Match
            </h1>
            <Heart className="w-8 h-8 text-primary fill-primary animate-heartbeat" />
          </div>
          <p className="text-muted-foreground text-lg">
            Discover your Valentine's compatibility 💕
          </p>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center">
          {gameState === "landing" && (
            <div className="text-center animate-fade-in-up">
              <div className="bg-card rounded-3xl shadow-romantic p-8 md:p-12 max-w-lg mx-auto border border-rose-light/50">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Heart className="w-20 h-20 text-primary fill-primary animate-heartbeat" />
                    <Sparkles className="w-8 h-8 text-gold absolute -top-2 -right-2" />
                  </div>
                </div>

                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  Test Your Love
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Generate a QR code, scan it with your partner, answer questions together,
                  and discover how compatible you are this Valentine's Day!
                </p>

                <div className="space-y-4">
                  <Button
                    onClick={startNewSession}
                    size="lg"
                    className="w-full h-14 gradient-romantic text-primary-foreground font-semibold text-lg shadow-romantic hover:shadow-glow transition-all"
                  >
                    <QrCode className="w-6 h-6 mr-2" />
                    Generate QR Code
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    Both partners scan the same code to begin
                  </p>
                </div>
              </div>
            </div>
          )}

          {gameState === "qr-display" && (
            <div className="text-center animate-fade-in-up">
              <h2 className="font-display text-2xl text-foreground mb-6">
                Scan Together
              </h2>
              <QRCodeDisplay
                sessionId={sessionId}
                scannedCount={scannedCount}
                isBlurred={scannedCount >= 2}
              />
            </div>
          )}

          {gameState === "name-input" && (
            <NameInput
              partnerNumber={currentPartner}
              onSubmit={handleNameSubmit}
            />
          )}

          {gameState === "questions" && (
            <QuestionCard
              question={loveQuestions[currentQuestionIndex]}
              currentIndex={currentQuestionIndex}
              totalQuestions={loveQuestions.length}
              onAnswer={handleAnswer}
              partnerName={currentPartner === 1 ? partner1.name : partner2.name}
            />
          )}

          {gameState === "waiting" && (
            <div className="text-center animate-fade-in-up">
              <div className="bg-card rounded-2xl shadow-romantic p-8 max-w-md mx-auto border border-rose-light/50">
                <div className="animate-pulse mb-6">
                  <Heart className="w-16 h-16 text-primary fill-primary mx-auto animate-heartbeat" />
                </div>
                <h2 className="font-display text-2xl text-foreground mb-2">
                  Waiting for Your Partner
                </h2>
                <p className="text-muted-foreground">
                  {partner1.name || "Partner"} has finished answering.
                  Please wait while your partner completes their questions...
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}

          {gameState === "results" && (
            <CompatibilityResult
              score={compatibilityScore}
              partner1Name={partner1.name || "Partner 1"}
              partner2Name={partner2.name || "Partner 2"}
              partner1Answers={partner1.answers}
              partner2Answers={partner2.answers}
              onNewSession={handleNewSession}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-muted-foreground">
          <p>Made with 💕 for Valentine's Day 2026</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
