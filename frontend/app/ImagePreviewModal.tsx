import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ZoomableImage from "./ZoomableImage";
import DrawingLayer from "./DrawingLayer";

/* ------------------ Types ------------------ */

interface ImagePreviewModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

/* ------------------ Component ------------------ */

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  imageUrl,
  onClose,
}) => {
  const [clearTrigger, setClearTrigger] = useState<number>(0);
  const [drawEnabled, setDrawEnabled] = useState<boolean>(false);

  const isPdf: boolean =
    !!imageUrl && imageUrl.toLowerCase().endsWith(".pdf");

  const getPdfUrl = (url: string): string =>
    `${url}?response-content-type=application/pdf`;

  if (!imageUrl) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            {/* Draw toggle */}
            <TouchableOpacity
              onPress={() => setDrawEnabled((prev) => !prev)}
            >
              <Text style={styles.tool}>
                {drawEnabled ? "✏️ Draw On" : "✏️ Draw Off"}
              </Text>
            </TouchableOpacity>

            {/* Close button */}
            <TouchableOpacity
              onPress={() => {
                setClearTrigger((c) => c + 1);
                setDrawEnabled(false);
                onClose();
              }}
            >
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* IMAGE / PDF VIEWER */}
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.viewer}>
              {isPdf ? (
                <View style={styles.pdfContainer}>
                  <Text style={styles.pdfTitle}>PDF Document</Text>

                  <TouchableOpacity
                    style={styles.openButton}
                    onPress={async () => {
                      const pdfUrl = getPdfUrl(imageUrl);

                      if (Platform.OS === "web") {
                        window.open(pdfUrl, "_blank");
                      } else {
                        await WebBrowser.openBrowserAsync(pdfUrl);
                      }
                    }}
                  >
                    <Text style={styles.openText}>Open PDF</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ZoomableImage imageUrl={imageUrl} />
              )}

              {/* Drawing layer (only when enabled) */}
              {drawEnabled && (
                <DrawingLayer clearTrigger={clearTrigger} />
              )}
            </View>
          </GestureHandlerRootView>
        </View>
      </View>
    </Modal>
  );
};

export default ImagePreviewModal;

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "92%",
    height: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },

  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#5390e6ff",
  },

  tool: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  close: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },

  viewer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  pdfContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  pdfTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  openButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1a73e8",
    borderRadius: 8,
  },

  openText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
