import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";

interface FlashCardProps {
  question: string;
  options: string[];
  selected: string | null;
  correct: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
  question,
  options,
  selected,
  correct,
  onAnswer,
  onNext,
}) => {
  return (
    <Card
      sx={{
        width: "90%",
        maxWidth: 600,
        margin: "2rem auto",
        padding: { xs: 2, sm: 3 },
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {question}
        </Typography>
        <Stack spacing={2} mt={2}>
          {options.map((opt, idx) => {
            let variant: "contained" | "outlined" = "outlined";
            if (selected) {
              if (opt === correct) variant = "contained";
              else if (opt === selected) variant = "outlined";
            }
            return (
              <Button
                key={idx}
                fullWidth
                variant={variant}
                color={
                  selected
                    ? opt === correct
                      ? "success"
                      : opt === selected
                      ? "error"
                      : "primary"
                    : "primary"
                }
                onClick={() => onAnswer(opt)}
                disabled={!!selected}
              >
                {opt}
              </Button>
            );
          })}
        </Stack>
        {selected && (
          <Box textAlign="center" mt={4}>
            <Button variant="contained" onClick={onNext}>
              Επόμενη
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashCard;
