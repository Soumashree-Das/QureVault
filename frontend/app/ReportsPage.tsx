import { useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/utils/apiFetch";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  ListRenderItem,
} from "react-native";
import ImagePreviewModal from "./ImagePreviewModal";

// const BACKEND_URL = "https://qurevault-ver1.onrender.com";
const BACKEND_URL = "http://192.168.0.202:8080";
// const BACKEND_URL = "http://localhost:8080";

/* ------------------ Types ------------------ */

type MedicalRecordType = "prescription" | "report";

// interface MedicalRecord {
//   _id: string;
//   type: "prescription" | "report";
//   document_date?: string;
//   extracted_date?: string;
//   report_date?: string;
// }

interface MedicalRecord {
  _id: string;
  type: "prescription" | "report";
  prescription_name?: string;
  report_name?: string;
  document_date?: string;
  extracted_date?: string;
  report_date?: string;
}


interface GroupedRecords {
  key: string;
  label: string;
  prescriptions: MedicalRecord[];
  reports: MedicalRecord[];
}

/* ------------------ Helpers ------------------ */

const isPdfFile = (url: string): boolean =>
  url.toLowerCase().endsWith(".pdf");

const getDocumentDate = (record?: MedicalRecord | null): Date | null => {
  if (!record) return null;

  const date =
    record.document_date ||
    record.extracted_date ||
    record.report_date ||
    null;

  const parsed = date ? new Date(date) : null;
  return parsed && !isNaN(parsed.getTime()) ? parsed : null;
};

const groupRecordsByMonth = (
  records: MedicalRecord[]
): GroupedRecords[] => {
  const map = new Map<string, GroupedRecords>();

  for (const record of records) {
    const docDate = getDocumentDate(record);
    if (!docDate) continue;

    const monthKey = `${docDate.getFullYear()}-${docDate.getMonth()}`;

    if (!map.has(monthKey)) {
      map.set(monthKey, {
        key: monthKey,
        label: docDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        prescriptions: [],
        reports: [],
      });
    }

    if (record.type === "prescription") {
      map.get(monthKey)!.prescriptions.push(record);
    } else {
      map.get(monthKey)!.reports.push(record);
    }
  }

  for (const group of map.values()) {
    group.prescriptions.sort(
      (a, b) =>
        (getDocumentDate(b)?.getTime() ?? 0) -
        (getDocumentDate(a)?.getTime() ?? 0)
    );

    group.reports.sort(
      (a, b) =>
        (getDocumentDate(b)?.getTime() ?? 0) -
        (getDocumentDate(a)?.getTime() ?? 0)
    );
  }

  return Array.from(map.values()).sort((a, b) => {
    const aLatest =
      getDocumentDate(a.prescriptions[0]) ||
      getDocumentDate(a.reports[0]);

    const bLatest =
      getDocumentDate(b.prescriptions[0]) ||
      getDocumentDate(b.reports[0]);

    return (bLatest?.getTime() ?? 0) - (aLatest?.getTime() ?? 0);
  });
};

/* ------------------ Component ------------------ */

const reportspage: React.FC = () => {
  const params = useLocalSearchParams<{ user_id?: string }>();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);

  // const params = useLocalSearchParams<{ user_id?: string }>();
  const { width } = useWindowDimensions();

  const HORIZONTAL_PADDING = 20;
  const GAP = 16;

  const numColumns = width >= 1200 ? 4 : width >= 768 ? 3 : 2;

  const cardWidth =
    (width -
      HORIZONTAL_PADDING * 2 -
      GAP * (numColumns - 1)) /
    numColumns;

  const fetchSignedFileUrl = async (record: MedicalRecord) => {
    const endpoint =
      record.type === "prescription"
        ? `/patient/prescription/${record._id}/file`
        : `/patient/report/${record._id}/file`;

    const res = await apiFetch(endpoint);

    if (!res.ok) {
      throw new Error("Failed to fetch file");
    }

    const data = await res.json();
    return data.url; // signed Cloudinary URL
  };


  // const fetchRecords = async (): Promise<void> => {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     const res = await apiFetch("/patient/records");

  //     const data = await res.json();

  //     if (!res.ok) {
  //       throw new Error(data.message || "Failed to fetch records");
  //     }

  //     setRecords(data.records ?? []);
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to fetch medical records.");
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };
  const fetchRecords = async (): Promise<void> => {
  try {
    setLoading(true);
    setError("");

    let res;

    if (params.user_id) {
      // Public access (QR)
      res = await fetch(
        `${BACKEND_URL}/patient/public/${params.user_id}/records`
      );
    } else {
      // Private access
      res = await apiFetch("/patient/records");
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch records");
    }

    setRecords(data.records ?? []);

  } catch (err) {
    console.error(err);
    setError("Failed to fetch medical records.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};



  useEffect(() => {
    fetchRecords();
  }, []);

  const groupedRecords = useMemo(
    () => groupRecordsByMonth(records),
    [records]
  );

  const renderItem: ListRenderItem<MedicalRecord> = ({ item }) => {

    const docDate = getDocumentDate(item);

    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}

        onPress={async () => {
          try {
            const signedUrl = await fetchSignedFileUrl(item);
            setSelectedImage(signedUrl);
            setPreviewVisible(true);
          } catch (err) {
            Alert.alert("Error", "Unable to open file");
          }
        }}

      >
        <View style={[styles.image, styles.pdfPreview]}>
          <Text style={styles.pdfIcon}>🖼️</Text>
          <Text style={styles.pdfLabel}>VIEW</Text>
        </View>


        {/* <View style={styles.cardInfo}>
          <Text style={styles.type}>{item.type.toUpperCase()}</Text>
          <Text style={styles.date}>
            {docDate
              ? docDate.toLocaleDateString()
              : "Date unavailable"}
          </Text>
        </View> */}
        <View style={styles.cardInfo}>
          <Text style={styles.recordName}>
            {item.type === "prescription"
              ? item.prescription_name || "Prescription"
              : item.report_name || "Report"}
          </Text>

          <Text style={styles.type}>{item.type.toUpperCase()}</Text>

          <Text style={styles.date}>
            {docDate
              ? docDate.toLocaleDateString()
              : "Date unavailable"}
          </Text>
        </View>

      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Loading records...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchRecords}
          />
        }
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {groupedRecords.length === 0 ? (
          <Text style={styles.emptyText}>No records found</Text>
        ) : (
          groupedRecords.map((group) => (
            <View key={group.key}>
              <Text style={styles.sectionTitle}>{group.label}</Text>

              {[...group.prescriptions, ...group.reports].length > 0 && (
                <FlatList
                  key={`grid-${numColumns}`}
                  data={[...group.prescriptions, ...group.reports]}
                  renderItem={renderItem}
                  keyExtractor={(item) => item._id}
                  numColumns={numColumns}
                  columnWrapperStyle={
                    numColumns > 1 ? styles.row : undefined
                  }
                  contentContainerStyle={{
                    paddingHorizontal: HORIZONTAL_PADDING,
                  }}
                  scrollEnabled={false}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>

      <ImagePreviewModal
        visible={previewVisible}
        imageUrl={selectedImage}
        onClose={() => {
          setPreviewVisible(false);
          setSelectedImage(null);
        }}
      />
    </View>
  );
};

export default reportspage;

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f8ff",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2458a3",
    margin: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  image: {
    width: "100%",
    height: 140,
  },
  cardInfo: {
    padding: 10,
  },
  type: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a73e8",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#1a73e8",
  },
  errorBox: {
    backgroundColor: "#ffe5e5",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#d9534f",
    textAlign: "center",
  },
  pdfPreview: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef3ff",
  },
  pdfIcon: {
    fontSize: 40,
  },
  pdfLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#1a73e8",
  },
  recordName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },

});
