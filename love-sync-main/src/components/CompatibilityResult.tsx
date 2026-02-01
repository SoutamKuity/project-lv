import { Heart, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loveQuestions } from "@/data/questions";

interface CompatibilityResultProps {
  score: number;
  partner1Name: string;
  partner2Name: string;
  partner1Answers: string[];
  partner2Answers: string[];
  onNewSession: () => void;
}

const CompatibilityResult = ({
  score,
  partner1Name,
  partner2Name,
  partner1Answers,
  partner2Answers,
  onNewSession,
}: CompatibilityResultProps) => {
  const getMessage = () => {
    if (score >= 90)
      return {
        title: "Soulmates! 💞",
        desc: "You two are absolutely perfect for each other!",
      };
    if (score >= 70)
      return {
        title: "Amazing Match! 💕",
        desc: "Your love connection is incredibly strong!",
      };
    if (score >= 50)
      return {
        title: "Good Compatibility! 💗",
        desc: "You complement each other beautifully!",
      };
    if (score >= 30)
      return {
        title: "Growing Together! 💖",
        desc: "Every great love story starts somewhere!",
      };
    return {
      title: "Opposites Attract! 💝",
      desc: "Your differences make you unique!",
    };
  };

  const { title, desc } = getMessage();

  // Stable derived stats (NO randomness)
  const communication = Math.min(100, score + 5);
  const values = Math.min(100, score);
  const romance = Math.min(100, score + 10);

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-card rounded-3xl shadow-romantic p-8 border border-rose-light/50 text-center">
        {/* Decorative hearts */}
        <div className="flex justify-center gap-4 mb-6">
          <Heart className="w-6 h-6 text-primary fill-primary animate-float" />
          <Sparkles className="w-8 h-8 text-gold" />
          <Heart className="w-6 h-6 text-primary fill-primary animate-float" />
        </div>

        {/* Title */}
        <h2 className="font-display text-3xl text-foreground mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground mb-8">{desc}</p>

        {/* Score circle */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.83} 283`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(340, 82%, 62%)" />
                <stop offset="100%" stopColor="hsl(25, 95%, 65%)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-display font-bold text-gradient">
              {score}%
            </span>
            <span className="text-sm text-muted-foreground">
              compatibility
            </span>
          </div>
        </div>

        {/* Partner names */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-secondary px-4 py-2 rounded-full">
            <span className="font-medium">{partner1Name}</span>
          </div>
          <Heart className="w-5 h-5 text-primary fill-primary animate-heartbeat" />
          <div className="bg-secondary px-4 py-2 rounded-full">
            <span className="font-medium">{partner2Name}</span>
          </div>
        </div>

        {/* Love stats */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-8">
          <h4 className="font-semibold mb-3">Your Love Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Communication</span>
              <span className="font-medium">{communication}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Values</span>
              <span className="font-medium">{values}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Romance</span>
              <span className="font-medium">{romance}%</span>
            </div>
          </div>
        </div>

        {/* Answer comparison */}
        <div className="bg-secondary/30 rounded-xl p-4 mb-8 text-left">
          <h4 className="font-semibold mb-4 text-center">
            Answer Comparison
          </h4>

          <div className="space-y-4">
            {partner1Answers.map((ans1, index) => {
              const ans2 = partner2Answers[index];
              const matched = ans1 === ans2;
              const question = loveQuestions[index]?.question;

              return (
                <div
                  key={index}
                  className={`px-4 py-3 rounded-lg text-sm space-y-2 ${matched
                      ? "bg-green-500/10 border border-green-500/20 text-green-600"
                      : "bg-red-500/10 border border-red-500/20 text-red-600"
                    }`}
                >
                  {/* Question */}
                  <p className="font-medium text-foreground">
                    Q{index + 1}. {question}
                  </p>

                  {/* Answers */}
                  <div className="flex justify-between gap-4">
                    <span>
                      <strong>{partner1Name}:</strong> {ans1}
                    </span>
                    <span>
                      <strong>{partner2Name}:</strong> {ans2}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* New session button */}

      </div>
    </div>
  );
};

export default CompatibilityResult;
