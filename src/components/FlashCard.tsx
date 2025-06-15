import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";

interface FlashCardProps {
  question: string;
  options: string[];
  selected: string | null;
  correct: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  disableAll?: boolean;
}

const FlashCard: React.FC<FlashCardProps> = ({
  question,
  options,
  selected,
  correct,
  onAnswer,
  disableAll = false,
}) => {
  return (
    <Card
      sx={{
        width: "90%",
        maxWidth: 600,
        margin: "0 auto",
        padding: { xs: 2, sm: 3 },
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {question}
        </Typography>

        <Stack spacing={2} mt={2}>
          {options.map((opt, idx) => {
            // Αποφασίζουμε το χρώμα και το στυλ
            let variant: "contained" | "outlined" = "outlined";
            if (selected) {
              if (opt === correct) variant = "contained";
              else if (opt === selected) variant = "outlined";
            }

            let color: "primary" | "success" | "error" = "primary";
            if (selected) {
              if (opt === correct) color = "success";
              else if (opt === selected) color = "error";
            }

            return (
              <Button
                key={idx}
                fullWidth
                variant={variant}
                color={color}
                onClick={() => onAnswer(opt)}
                disabled={disableAll && selected !== null}
              >
                {opt}
              </Button>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FlashCard;
