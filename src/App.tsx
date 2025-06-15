import { useEffect, useState } from "react";
import yaml from "js-yaml";
import { categories } from "./data/categories";
import FlashCard from "./components/FlashCard";
import {
  Container,
  Typography,
  Button,
  Box,
  Stack,
  LinearProgress,
} from "@mui/material";

// Για να φορτώσουμε YAML δυναμικά με Vite
const files = import.meta.glob("./data/*.yaml", {
  query: "?raw",
  import: "default",
});

interface Question {
  question: string;
  options: string[];
  answer: string;
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // ✔ Φορτώνει YAML μόλις επιλεγεί ενότητα
  useEffect(() => {
    if (!selectedCategory) return;

    const category = categories.find((c) => c.label === selectedCategory);
    if (!category) return;

    const path = `./data/${category.file}`;
    const loader = files[path];

    if (loader) {
      loader().then((rawYaml) => {
        const loaded = yaml.load(rawYaml as string) as Question[];
        setQuestions(loaded);
        setCurrent(0);
        setScore(0);
        setWrongCount(0);
        setSelected(null);
        setIsCorrect(null);
        setAnsweredCorrectly(false);
        setShowResult(false);
        setTimeLeft(60);
        setAutoAdvance(false);
      });
    }
  }, [selectedCategory]);

  // ⏱ Αντίστροφη μέτρηση
  useEffect(() => {
    if (answeredCorrectly || showResult || !questions.length) return;

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
  }, [timeLeft, answeredCorrectly, showResult, selected, questions]);

  useEffect(() => {
    setTimeLeft(60);
  }, [current]);

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
      setAutoAdvance(true);
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
    setSelectedCategory(null);
    setQuestions([]);
    setCurrent(0);
    setScore(0);
    setWrongCount(0);
    setSelected(null);
    setIsCorrect(null);
    setAnsweredCorrectly(false);
    setShowResult(false);
    setTimeLeft(60);
    setAutoAdvance(false);
  };

  if (!selectedCategory) {
    return (
      <Container maxWidth="sm">
        <Box mt={10} textAlign="center">
          <Typography variant="h5" gutterBottom>
            Επιλογή Ενότητας
          </Typography>
          <Stack spacing={2} mt={4}>
            {categories.map((cat) => (
              <Button
                key={cat.label}
                variant="contained"
                onClick={() => setSelectedCategory(cat.label)}
              >
                {cat.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Container>
    );
  }

  if (!questions.length) {
    return (
      <Container maxWidth="sm">
        <Box mt={10} textAlign="center">
          <Typography>Φόρτωση ερωτήσεων...</Typography>
        </Box>
      </Container>
    );
  }

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
          Επιστροφή στην επιλογή ενότητας
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

        <LinearProgress
          variant="determinate"
          value={(current / questions.length) * 100}
          sx={{ height: 10, borderRadius: 5, mt: 2, mb: 2 }}
        />

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
