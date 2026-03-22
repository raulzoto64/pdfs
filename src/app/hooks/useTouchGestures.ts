/**
 * Hook para gestos tactiles avanzados
 * Soporta pinch (zoom), rotate, pan y double tap
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface TouchPoint {
  x: number;
  y: number;
}

export interface GestureState {
  scale: number;
  rotation: number;
  position: TouchPoint;
  isGesturing: boolean;
  gestureType: 'none' | 'pan' | 'pinch' | 'rotate';
}

export interface UseTouchGesturesOptions {
  onPinch?: (scale: number, center: TouchPoint) => void;
  onRotate?: (angle: number, center: TouchPoint) => void;
  onPan?: (delta: TouchPoint, position: TouchPoint) => void;
  onDoubleTap?: (position: TouchPoint) => void;
  onTap?: (position: TouchPoint) => void;
  onLongPress?: (position: TouchPoint) => void;
  onGestureStart?: () => void;
  onGestureEnd?: (state: GestureState) => void;
  disabled?: boolean;
  minScale?: number;
  maxScale?: number;
  doubleTapDelay?: number;
  longPressDelay?: number;
}

export interface UseTouchGesturesReturn {
  gestureState: GestureState;
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  resetGesture: () => void;
}

interface TouchData {
  startTouches: Touch[];
  startDistance: number;
  startAngle: number;
  startCenter: TouchPoint;
  startTime: number;
  lastTapTime: number;
}

function getDistance(t1: Touch, t2: Touch): number {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getAngle(t1: Touch, t2: Touch): number {
  return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
}

function getCenter(t1: Touch, t2: Touch): TouchPoint {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

const DEFAULT_STATE: GestureState = {
  scale: 1,
  rotation: 0,
  position: { x: 0, y: 0 },
  isGesturing: false,
  gestureType: 'none',
};

export function useTouchGestures(options: UseTouchGesturesOptions = {}): UseTouchGesturesReturn {
  const {
    onPinch,
    onRotate,
    onPan,
    onDoubleTap,
    onTap,
    onLongPress,
    onGestureStart,
    onGestureEnd,
    disabled = false,
    minScale = 0.5,
    maxScale = 3,
    doubleTapDelay = 300,
    longPressDelay = 500,
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>(DEFAULT_STATE);

  const touchDataRef = useRef<TouchData>({
    startTouches: [],
    startDistance: 0,
    startAngle: 0,
    startCenter: { x: 0, y: 0 },
    startTime: 0,
    lastTapTime: 0,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedStateRef = useRef<GestureState>(DEFAULT_STATE);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    const touches = Array.from(e.touches);
    const now = Date.now();

    touchDataRef.current = {
      ...touchDataRef.current,
      startTouches: touches,
      startTime: now,
    };

    // Un solo dedo
    if (touches.length === 1) {
      const touch = touches[0];
      const position = { x: touch.clientX, y: touch.clientY };

      // Detectar double tap
      if (now - touchDataRef.current.lastTapTime < doubleTapDelay) {
        clearLongPressTimer();
        onDoubleTap?.(position);
        touchDataRef.current.lastTapTime = 0;
        return;
      }

      // Iniciar timer de long press
      longPressTimerRef.current = setTimeout(() => {
        onLongPress?.(position);
      }, longPressDelay);

      setGestureState(prev => ({
        ...prev,
        isGesturing: true,
        gestureType: 'pan',
        position,
      }));

      onGestureStart?.();
    }

    // Dos dedos (pinch/rotate)
    if (touches.length === 2) {
      clearLongPressTimer();

      const distance = getDistance(touches[0], touches[1]);
      const angle = getAngle(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);

      touchDataRef.current = {
        ...touchDataRef.current,
        startDistance: distance,
        startAngle: angle,
        startCenter: center,
      };

      setGestureState(prev => ({
        ...prev,
        isGesturing: true,
        gestureType: 'pinch',
      }));

      onGestureStart?.();
    }
  }, [disabled, doubleTapDelay, longPressDelay, clearLongPressTimer, onDoubleTap, onLongPress, onGestureStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !gestureState.isGesturing) return;

    clearLongPressTimer();
    const touches = Array.from(e.touches);

    // Pan con un dedo
    if (touches.length === 1 && gestureState.gestureType === 'pan') {
      const touch = touches[0];
      const startTouch = touchDataRef.current.startTouches[0];
      
      if (startTouch) {
        const delta = {
          x: touch.clientX - startTouch.clientX,
          y: touch.clientY - startTouch.clientY,
        };
        const position = { x: touch.clientX, y: touch.clientY };

        setGestureState(prev => ({ ...prev, position }));
        onPan?.(delta, position);
      }
    }

    // Pinch/rotate con dos dedos
    if (touches.length === 2) {
      const currentDistance = getDistance(touches[0], touches[1]);
      const currentAngle = getAngle(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);

      // Calcular escala
      let scale = (currentDistance / touchDataRef.current.startDistance) * accumulatedStateRef.current.scale;
      scale = Math.max(minScale, Math.min(maxScale, scale));

      // Calcular rotacion
      const rotation = currentAngle - touchDataRef.current.startAngle + accumulatedStateRef.current.rotation;

      setGestureState(prev => ({
        ...prev,
        scale,
        rotation,
        gestureType: 'pinch',
      }));

      onPinch?.(scale, center);
      onRotate?.(rotation, center);
    }
  }, [disabled, gestureState.isGesturing, gestureState.gestureType, clearLongPressTimer, minScale, maxScale, onPan, onPinch, onRotate]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    const remainingTouches = e.touches.length;
    const now = Date.now();
    const duration = now - touchDataRef.current.startTime;

    clearLongPressTimer();

    // Tap detection (toque rapido sin movimiento significativo)
    if (remainingTouches === 0 && duration < 200) {
      const startTouch = touchDataRef.current.startTouches[0];
      if (startTouch) {
        const position = { x: startTouch.clientX, y: startTouch.clientY };
        onTap?.(position);
        touchDataRef.current.lastTapTime = now;
      }
    }

    // Si no quedan toques, terminar gesto
    if (remainingTouches === 0) {
      // Guardar estado acumulado para proxima vez
      accumulatedStateRef.current = {
        ...gestureState,
        isGesturing: false,
        gestureType: 'none',
      };

      setGestureState(prev => ({
        ...prev,
        isGesturing: false,
        gestureType: 'none',
      }));

      onGestureEnd?.(gestureState);
    }

    // Si queda un dedo, cambiar a pan
    if (remainingTouches === 1) {
      const touch = e.touches[0];
      touchDataRef.current.startTouches = [touch];

      setGestureState(prev => ({
        ...prev,
        gestureType: 'pan',
        position: { x: touch.clientX, y: touch.clientY },
      }));
    }
  }, [disabled, gestureState, clearLongPressTimer, onTap, onGestureEnd]);

  const resetGesture = useCallback(() => {
    setGestureState(DEFAULT_STATE);
    accumulatedStateRef.current = DEFAULT_STATE;
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return {
    gestureState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetGesture,
  };
}

export default useTouchGestures;
