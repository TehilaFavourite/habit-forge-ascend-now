import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, Brain, Target, CheckCircle } from "lucide-react";

interface LearningItem {
  id: string;
  title: string;
  status: "learning" | "completed" | "revisit";
  notes: string;
  dateAdded: Date;
  priority: "low" | "medium" | "high";
}

interface FlashcardLearningProps {
  items: LearningItem[];
  onUpdateStatus: (id: string, status: LearningItem["status"]) => void;
}

export const FlashcardLearning: React.FC<FlashcardLearningProps> = ({
  items,
  onUpdateStatus,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (items.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-learning-bg to-learning-secondary border-learning-border">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-learning-primary mx-auto mb-4" />
          <p className="text-learning-text">No learning items for today</p>
        </CardContent>
      </Card>
    );
  }

  const currentItem = items[currentIndex];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-learning-secondary text-learning-text border-learning-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "revisit":
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setShowAnswer(false);
  };

  const handleStatusUpdate = (status: LearningItem["status"]) => {
    onUpdateStatus(currentItem.id, status);
    if (currentIndex < items.length - 1) {
      nextCard();
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-learning-secondary text-onboarding-text border-learning-border">
            {currentIndex + 1} of {items.length}
          </Badge>
          <Badge className={getPriorityColor(currentItem.priority)}>
            {currentItem.priority}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevCard}
            disabled={items.length <= 1}
            className="border-learning-border hover:bg-learning-secondary"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextCard}
            disabled={items.length <= 1}
            className="border-learning-border hover:bg-learning-secondary"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Flashcard */}
      <Card className="bg-gradient-to-br from-learning-bg to-learning-secondary border-learning-border min-h-[300px]">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-4">
            {getStatusIcon(currentItem.status)}
            <h3 className="text-xl font-semibold text-onboarding-text">
              {currentItem.title}
            </h3>
          </div>

          <div className="space-y-6">
            {!showAnswer ? (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 text-learning-primary mx-auto mb-4 opacity-50" />
                <p className="text-lg text-learning-text mb-6">
                  Think about what you've learned...
                </p>
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="bg-learning-primary hover:bg-learning-primary/80 text-white"
                >
                  Show Answer
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-learning-secondary/50 p-6 rounded-lg border border-learning-border">
                  <p className="text-learning-text whitespace-pre-wrap">
                    {currentItem.notes}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate("revisit")}
                    className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Need Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate("learning")}
                    className="border-learning-border text-learning-text hover:bg-learning-secondary"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Still Learning
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("completed")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Got It!
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};