import { useRef, useEffect } from "react";
import { css, keyframes } from "emotion";

function translateAndScale(source, target) {
  const sx = source.width / target.width;
  const sy = source.height / target.height;
  const dx = source.x - target.x;
  const dy = source.y - target.y;
  return keyframes`
    from {
      transform: translate(${dx}px, ${dy}px) scale(${sx}, ${sy});
    }
  `;
}

function sameBounds(source, target) {
  return ["top", "right", "bottom", "left"].every(
    (key) => source[key] === target[key]
  );
}

export default ({
  transformOrigin = "0 0",
  duration = 500,
  timingFunction = "ease",
  delay = 0,
  iterationCount = 1,
  direction = "normal",
  fillMode = "both",
  playState = "running",
  keyframes = translateAndScale,
  playCss = ""
} = {}) => {
  if (typeof duration !== "number") {
    duration = Math.round(duration);
  }
  const sourceRef = useRef({});
  const targetRef = useRef();

  useEffect(() => {
    // FIRST
    const { source } = sourceRef.current;

    // LAST
    const child = targetRef.current;
    if (!child) {
      return;
    }
    const target = child.getBoundingClientRect();

    // target is next source
    sourceRef.current = {
      source: target
    };

    // INVERT
    if (!source) {
      return;
    }
    if (sameBounds(source, target)) {
      return;
    }
    const animation = keyframes(source, target);
    const animationClass = css`
      transform-origin: ${transformOrigin};
      animation-duration: ${duration}ms;
      animation-timing-function: ${timingFunction};
      animation-delay: ${delay}ms;
      animation-iteration-count: ${iterationCount};
      animation-direction: ${direction};
      animation-fill-mode: ${fillMode};
      animation-play-state: ${playState};
      animation-name: ${animation};
      ${playCss};
    `;

    // PLAY
    child.classList.add(animationClass);
    return () => {
      child.classList.remove(animationClass);
    };
  }); // no deps as we need this effect to run on every update

  return targetRef;
};
