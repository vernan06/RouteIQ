// src/hooks/useAlgoEngine.js
import { useState, useEffect, useRef } from 'react';

export default function useAlgoEngine(initialSteps = [], defaultSpeed = 1) {
  const [steps, setSteps] = useState(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed); // speed multiplier, e.g. 0.25, 0.5, 1, 2, 4

  const isPlayingRef = useRef(isPlaying);
  const currentStepRef = useRef(currentStep);
  const stepsRef = useRef(steps);
  const speedRef = useRef(speed);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const stepForward = () => {
    if (currentStepRef.current < stepsRef.current.length - 1) {
      setCurrentStep(prev => prev + 1);
      return true;
    }
    setIsPlaying(false);
    return false;
  };

  const stepBack = () => {
    if (currentStepRef.current > 0) {
      setCurrentStep(prev => prev - 1);
      return true;
    }
    return false;
  };

  const play = () => {
    if (stepsRef.current.length === 0) return;
    if (currentStepRef.current >= stepsRef.current.length - 1) {
      // Auto-reset if playing from the end
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const jumpToStep = (index) => {
    if (index >= 0 && index < stepsRef.current.length) {
      setCurrentStep(index);
    }
  };

  // Autoplay effect
  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      if (currentStepRef.current < stepsRef.current.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    // Base interval is 1000ms
    const intervalTime = Math.max(50, 1000 / speedRef.current);
    const id = setInterval(tick, intervalTime);

    return () => clearInterval(id);
  }, [isPlaying, speed]);

  const updateSteps = (newSteps) => {
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return {
    steps,
    currentStep,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setSpeed,
    setSteps: updateSteps,
    jumpToStep
  };
}
