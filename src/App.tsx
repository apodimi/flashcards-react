import { useState } from "react";
import yaml from "js-yaml";
import raw from "./data/questions.yaml?raw";
import FlashCard from "./components/FlashCard";
import {
  Button,
  Typography,
  Box,
  LinearProgress,
  Container,
} from "@mui/material";

const questions: any[] = yaml.load(raw) as any[];

function App() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

  const handleAnswer = (answer: string) => {
    if (answeredCorrectly) return; // Μην επιτρέπει παραπάνω απαντήσεις μετά τη σωστή

    setSelected(answer);

    if (answer === questions[current].answer) {
      if (!answeredCorrectly) {
        setScore((prev) => prev + 1);
      }
      setIsCorrect(true);
      setAnsweredCorrectly(true);
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setIsCorrect(null);
    setAnsweredCorrectly(false);
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setAnsweredCorrectly(false);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h4" gutterBottom>
          Τέλος Quiz!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Σκορ: {score} / {questions.length}
        </Typography>
        <Button variant="contained" onClick={handleRestart}>
          Επανάληψη
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box mt={4} mb={2}>
        <Typography variant="body1">
          Ερώτηση {current + 1} από {questions.length}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(current / questions.length) * 100}
          sx={{ height: 10, borderRadius: 5, mt: 1 }}
        />
      </Box>

      <FlashCard
        question={questions[current].question}
        options={questions[current].options}
        selected={selected}
        correct={questions[current].answer}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />

      {selected && (
        <Box textAlign="center" mt={3}>
          <Typography
            variant="subtitle1"
            color={isCorrect ? "success.main" : "error.main"}
          >
            {isCorrect
              ? "Σωστά!"
              : `Λάθος! Η σωστή απάντηση είναι: ${questions[current].answer}`}
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default App;
