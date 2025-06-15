import { useState, useEffect } from "react";
import yaml from "js-yaml";
import raw from "./data/questions.yaml?raw";
import FlashCard from "./components/FlashCard";
import {
  Button,
  Typography,
  Box,
  LinearProgress,
  Container,
  Stack,
} from "@mui/material";

const questions: any[] = yaml.load(raw) as any[];

function App() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Χρονόμετρο
  useEffect(() => {
    if (answeredCorrectly || showResult) return;

    if (timeLeft === 0) {
      if (!answeredCorrectly && selected === null) {
        setSelected("__timeout__");
        setWrongCount((prev) => prev + 1);
        setIsCorrect(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, answeredCorrectly, showResult, selected]);

  // Reset χρονόμετρου όταν αλλάζει ερώτηση
  useEffect(() => {
    setTimeLeft(60);
  }, [current]);

  // Προχωρά αυτόματα όταν η απάντηση είναι σωστή
  useEffect(() => {
    if (autoAdvance) {
      const timer = setTimeout(() => {
        handleNext();
        setAutoAdvance(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance]);

  const handleAnswer = (answer: string) => {
    if (answeredCorrectly || selected !== null) return;

    setSelected(answer);

    if (answer === questions[current].answer) {
      setScore((prev) => prev + 1);
      setIsCorrect(true);
      setAnsweredCorrectly(true);
      setAutoAdvance(true); // σημαία για auto-next
    } else {
      setWrongCount((prev) => prev + 1);
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setIsCorrect(null);
    setAnsweredCorrectly(false);
    setTimeLeft(60);

    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setWrongCount(0);
    setSelected(null);
    setIsCorrect(null);
    setAnsweredCorrectly(false);
    setTimeLeft(60);
    setShowResult(false);
    setAutoAdvance(false);
  };

  if (showResult) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h4" gutterBottom>
          Τέλος Quiz!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Σωστά: {score} / {questions.length}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Λάθος: {wrongCount}
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

        {/* Live στατιστικά */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          mt={1}
        >
          <Typography variant="body2" color="success.main">
            Σωστά: {score}
          </Typography>
          <Typography variant="body2" color="error.main">
            Λάθος: {wrongCount}
          </Typography>
        </Stack>

        {/* Πρόοδος */}
        <LinearProgress
          variant="determinate"
          value={(current / questions.length) * 100}
          sx={{ height: 10, borderRadius: 5, mt: 2, mb: 2 }}
        />

        {/* Χρονόμετρο */}
        <Box mb={1}>
          <Typography
            variant="body2"
            align="right"
            color={timeLeft <= 10 ? "error" : "text.secondary"}
          >
            Χρόνος: {timeLeft}s
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(timeLeft / 60) * 100}
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: "#eee",
              "& .MuiLinearProgress-bar": {
                backgroundColor: timeLeft <= 10 ? "#d32f2f" : "#1976d2",
              },
            }}
          />
        </Box>
      </Box>

      <FlashCard
        question={questions[current].question}
        options={questions[current].options}
        selected={selected}
        correct={questions[current].answer}
        onAnswer={handleAnswer}
        onNext={handleNext}
        disableAll={answeredCorrectly}
      />

      {/* Feedback */}
      {selected !== null && (
        <Box textAlign="center" mt={3}>
          <Typography
            variant="subtitle1"
            color={isCorrect ? "success.main" : "error.main"}
          >
            {isCorrect
              ? "Σωστά!"
              : `Λάθος ή καθυστέρηση! Η σωστή απάντηση είναι: ${questions[current].answer}`}
          </Typography>
        </Box>
      )}

      {/* Κουμπί Επόμενη μόνο σε λάθος */}
      {selected !== null && !isCorrect && (
        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={handleNext}>
            Επόμενη
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default App;
