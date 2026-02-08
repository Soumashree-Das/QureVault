// Claude
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Linking,
    Image,
    Alert
} from "react-native";
import * as Location from "expo-location";

const BACKEND_URL = "https://qurevault-ver1.onrender.com/pharmacies";
// const BACKEND_URL = "http://192.168.0.202:8080/pharmacies";

type Pharmacy = {
    _id: string;
    name: string;
    address: string;
    discountPercent: number;
    distance: number;
    location: {
        coordinates: [number, number]; // [lng, lat]
    };
};

type FilterType = "distance" | "discount" | "recommended";

export default function Pharmacies() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>("recommended");

    useEffect(() => {
        fetchPharmacies(filter);
    }, [filter]);

    const fetchPharmacies = async (type: FilterType) => {
        setLoading(true);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Location permission is required");
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const lat = location.coords.latitude;
            const lng = location.coords.longitude;

            let endpoint = "";

            if (type === "distance") {
                endpoint = "/nearest-branches";
            } else if (type === "discount") {
                endpoint = "/lowest-cost";
                // endpoint = "/best-discount";
            } else {
                endpoint = "/nearby-best-discount";
            }

            console.log(`Fetching from: ${BACKEND_URL}${endpoint}?lat=${lat}&lng=${lng}`);

            const res = await fetch(
                `${BACKEND_URL}${endpoint}?lat=${lat}&lng=${lng}`
            );

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            
            console.log("Response data:", data);

            // Handle both old and new response formats
            if (data.pharmacies && Array.isArray(data.pharmacies)) {
                // New format: { success, count, seedInfo, pharmacies }
                setPharmacies(data.pharmacies);
                console.log(`Loaded ${data.pharmacies.length} pharmacies`);
            } else if (Array.isArray(data)) {
                // Old format: direct array
                setPharmacies(data);
                console.log(`Loaded ${data.length} pharmacies`);
            } else {
                console.error("Unexpected data format:", data);
                setPharmacies([]);
            }

        } catch (err) {
            console.error("Error fetching pharmacies:", err);
            Alert.alert("Error", "Failed to fetch pharmacies. Please try again.");
            setPharmacies([]);
        } finally {
            setLoading(false);
        }
    };

    const openGoogleInfo = (pharmacy: Pharmacy) => {
        const [lng, lat] = pharmacy.location.coordinates;
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(url);
    };

    const renderPharmacy = ({ item }: { item: Pharmacy }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => openGoogleInfo(item)}
        >
            <View style={styles.header}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.discount}>{item.discountPercent}% OFF</Text>
            </View>

            <Text style={styles.address}>{item.address}</Text>

            <Text style={styles.distance}>
                {(item.distance / 1000).toFixed(2)} km away
            </Text>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pharmacies found nearby</Text>
            <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => fetchPharmacies(filter)}
            >
                <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Image
                source={require("../../assets/medical-bg.jpg")}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            
            {/* Filters */}
            <View style={styles.filters}>
                <FilterButton
                    label="Nearest"
                    active={filter === "distance"}
                    onPress={() => setFilter("distance")}
                />
                <FilterButton
                    label="Best Discount"
                    active={filter === "discount"}
                    onPress={() => setFilter("discount")}
                />
                <FilterButton
                    label="Recommended"
                    active={filter === "recommended"}
                    onPress={() => setFilter("recommended")}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingText}>Loading pharmacies...</Text>
                </View>
            ) : (
                <FlatList
                    data={pharmacies}
                    keyExtractor={(item) => item._id}
                    renderItem={renderPharmacy}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </View>
    );
}

function FilterButton({
    label,
    active,
    onPress
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.filterBtn, active && styles.filterActive]}
            onPress={onPress}
        >
            <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    backgroundImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
    },
    filters: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16
    },
    filterBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ccc"
    },
    filterActive: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb"
    },
    filterText: {
        color: "#555"
    },
    filterTextActive: {
        color: "#fff",
        fontWeight: "600"
    },
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    name: {
        fontSize: 16,
        fontWeight: "600"
    },
    discount: {
        color: "#16a34a",
        fontWeight: "700"
    },
    address: {
        marginTop: 4,
        color: "#555"
    },
    distance: {
        marginTop: 6,
        color: "#666",
        fontSize: 12
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        marginTop: 10,
        color: "#666",
        fontSize: 14
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 16
    },
    retryButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    retryText: {
        color: "#fff",
        fontWeight: "600"
    }
});
















