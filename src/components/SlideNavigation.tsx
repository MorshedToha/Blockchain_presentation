import { createContext, useContext, useImperativeHandle, useLayoutEffect, useMemo, type ReactNode, type RefObject } from 'react';

export type SlideNavigation = {
  next: () => boolean;
  previous: () => boolean;
};

export type StepAvailability = {
  canNext: boolean;
  canPrevious: boolean;
  nextLabel: string;
};

type NavigationContextValue = {
  index: number;
  controllerRef: RefObject<SlideNavigation | null>;
  onAvailabilityChange: (index: number, availability: StepAvailability) => void;
};

type StepAction = { label: string; run: () => void };
const NavigationContext = createContext<NavigationContextValue | null>(null);

export function SlideNavigationProvider({ children, index, controllerRef, onAvailabilityChange }: NavigationContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ index, controllerRef, onAvailabilityChange }), [index, controllerRef, onAvailabilityChange]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

// Keyboard navigation uses the same state as the slide's own controls, not a separate reveal counter.
export function useSlideNavigation(next: StepAction | null, previous: (() => void) | null) {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('Slide navigation requires its provider.');
  const { index, controllerRef, onAvailabilityChange } = context;

  useImperativeHandle(controllerRef, () => ({
    next: () => {
      if (!next) return false;
      next.run();
      return true;
    },
    previous: () => {
      if (!previous) return false;
      previous();
      return true;
    },
  }), [next, previous]);

  const canNext = next !== null;
  const canPrevious = previous !== null;
  const nextLabel = next?.label ?? '';
  useLayoutEffect(() => {
    onAvailabilityChange(index, { canNext, canPrevious, nextLabel });
  }, [index, onAvailabilityChange, canNext, canPrevious, nextLabel]);
}