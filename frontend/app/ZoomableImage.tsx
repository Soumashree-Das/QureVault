import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";

/* ------------------ Types ------------------ */

interface ZoomableImageProps {
  imageUrl: string;
}

type WheelEventWeb = React.WheelEvent<HTMLDivElement>;

/* ------------------ Component ------------------ */

const ZoomableImage: React.FC<ZoomableImageProps> = ({ imageUrl }) => {
  const [scale, setScale] = useState<number>(1);

  const handleWheel = (e: WheelEventWeb): void => {
    if (Platform.OS !== "web") return;

    e.preventDefault();

    const zoomIn = e.deltaY < 0;
    setScale((prev) => {
      const next = zoomIn ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(next, 1), 4);
    });
  };

  return (
    <View
      style={styles.viewer}
      {...(Platform.OS === "web" ? { onWheel: handleWheel } : {})}
    >
      <img
        src={imageUrl}
        draggable={false}
        style={{
          transform: `scale(${scale})`,
          transition: "transform 0.1s ease-out",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </View>
  );
};

export default ZoomableImage;

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    backgroundColor: "#000",

    /* 🔑 Center image */
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    /* Prevent browser gestures */
    touchAction: "none",
    overflow: "hidden",
  },
});
