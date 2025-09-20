import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

type Prediction = {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
};

export default function SnapShotDetect() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const navigation = useNavigation();

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission]);

  const takeAndDetect = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: false,
        quality: 0.7,
        exif: false,
        skipProcessing: true,
      });

      setCapturedPhoto(photo.uri);
      setMessage("Detecting...");

      const apiKey = "pSXeGpbofKfXU8Rubbi2";

      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "snap.jpg",
      } as any);

      // Two model endpoints
      const graffitiUrl = `https://detect.roboflow.com/graffiti-5sa0t/1?api_key=${apiKey}&confidence=0.15&overlap=0.3`;
      const trashUrl = `https://detect.roboflow.com/trash-8lges/1?api_key=${apiKey}&confidence=0.15&overlap=0.3`;

      // Send to both models in parallel
      const [graffitiRes, trashRes] = await Promise.all([
        fetch(graffitiUrl, { method: "POST", body: formData }),
        fetch(trashUrl, { method: "POST", body: formData }),
      ]);

      const graffitiData = await graffitiRes.json();
      const trashData = await trashRes.json();

      // Collect predictions from both
      const graffitiPreds: Prediction[] = graffitiData?.predictions || [];
      const trashPreds: Prediction[] = trashData?.predictions || [];
      const allPredictions: Prediction[] = [...graffitiPreds, ...trashPreds];

      if (allPredictions.length > 0) {
        // Pick strongest prediction overall
        const best = allPredictions.reduce((max, p) =>
          p.confidence > max.confidence ? p : max
        );

        if (best.confidence >= 0.0) {
          // Decide type based on which array contains the best
          let autoType: string = "vandalism";
          if (trashPreds.includes(best)) {
            autoType = "trash";
          }

          navigation.navigate("Main", {
            screen: "Report",
            params: { autoType },
          });
        } else {
          setMessage(
            `No anomalies above 20%. Closest: ${best.class} ${(
              best.confidence * 100
            ).toFixed(1)}%`
          );
        }
      } else {
        setMessage("No detections at all. Try again.");
      }
    } catch (err) {
      console.error("Detection error", err);
      setMessage("Error during detection.");
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting permissions…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <>
          <Image source={{ uri: capturedPhoto }} style={styles.preview} />
          <Text style={styles.result}>{message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setCapturedPhoto(null);
              setMessage("");
            }}
          >
            <Text style={styles.buttonText}>Take Another</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <CameraView style={styles.camera} facing="back" ref={cameraRef} />

          {/* 🔙 Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* 📸 Capture Button */}
          <TouchableOpacity style={styles.shutter} onPress={takeAndDetect} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: "cover" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  shutter: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  button: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  result: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    color: "#fff",
    fontSize: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
  },
  backText: { color: "#fff", fontSize: 16 },
});
