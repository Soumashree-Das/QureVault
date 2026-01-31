import React, { useState, useEffect } from "react";

/* ------------------ Types ------------------ */

interface DrawingLayerProps {
  clearTrigger: number;
}

type SvgMouseEvent = React.MouseEvent<SVGSVGElement, MouseEvent>;

/* ------------------ Component ------------------ */

const DrawingLayer: React.FC<DrawingLayerProps> = ({ clearTrigger }) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [current, setCurrent] = useState<string>("");

  useEffect(() => {
    setPaths([]);
    setCurrent("");
  }, [clearTrigger]);

  const startDraw = (e: SvgMouseEvent): void => {
    setDrawing(true);

    const { offsetX, offsetY } = e.nativeEvent;
    setCurrent(`M ${offsetX} ${offsetY}`);
  };

  const draw = (e: SvgMouseEvent): void => {
    if (!drawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    setCurrent((prev) => `${prev} L ${offsetX} ${offsetY}`);
  };

  const endDraw = (): void => {
    if (current) {
      setPaths((prev) => [...prev, current]);
    }
    setCurrent("");
    setDrawing(false);
  };

  return (
    <svg
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={endDraw}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="red"
          strokeWidth={3}
          fill="none"
        />
      ))}

      {current && (
        <path
          d={current}
          stroke="red"
          strokeWidth={3}
          fill="none"
        />
      )}
    </svg>
  );
};

export default DrawingLayer;
