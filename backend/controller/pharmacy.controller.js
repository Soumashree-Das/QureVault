// claude
import axios from "axios";
import Pharmacy from "../model/pharmacy.model.js";

/* =========================================================
   CONFIG
   ========================================================= */

const SEED_RADIUS_METERS = 5000;
const MIN_PHARMACIES_THRESHOLD = 10;

/* =========================================================
   1️⃣ FETCH PHARMACIES FROM OSM
   ========================================================= */

export const fetchPharmaciesOSM = async (lat, lng) => {
  const query = `
    [out:json];
    node["amenity"="pharmacy"](around:${SEED_RADIUS_METERS},${lat},${lng});
    out body;
  `;

  const res = await axios.post(
    "https://overpass-api.de/api/interpreter",
    query,
    { headers: { "Content-Type": "text/plain" } }
  );

  return res.data.elements || [];
};

/* =========================================================
   2️⃣ ENSURE GEOSPATIAL INDEX EXISTS
   ========================================================= */

const ensureGeoIndex = async () => {
  try {
    const indexes = await Pharmacy.collection.getIndexes();
    const hasGeoIndex = Object.values(indexes).some(
      (index) => index.location === "2dsphere"
    );

    if (!hasGeoIndex) {
      await Pharmacy.collection.createIndex({ location: "2dsphere" });
      // console.log("✅ Created 2dsphere index");
    }
  } catch (err) {
    console.error("Error ensuring geo index:", err);
  }
};

/* =========================================================
   3️⃣ SAVE OSM DATA (HANDLE DUPLICATES GRACEFULLY)
   ========================================================= */

const saveOSM = async (osmPharmacies) => {
  const bulkOps = [];

  for (const p of osmPharmacies) {
    if (!p.lat || !p.lon) continue;

    bulkOps.push({
      updateOne: {
        filter: { "location.coordinates": [p.lon, p.lat] },
        update: {
          $setOnInsert: {
            name: p.tags?.name || "Unknown Pharmacy",
            address:
              p.tags?.["addr:street"] ||
              p.tags?.addr?.street ||
              "Address not available",
            location: {
              type: "Point",
              coordinates: [p.lon, p.lat],
            },
            discountPercent: Math.floor(Math.random() * 40) + 5, // 5-45%
          },
          $set: {
            isOpen: true,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulkOps.length > 0) {
    try {
      await Pharmacy.bulkWrite(bulkOps, { ordered: false });
    } catch (err) {
      // Ignore duplicate key errors (code 11000)
      if (err.code !== 11000 && !err.message.includes("E11000")) {
        console.error("Bulk write error:", err);
      }
    }
  }
};

/* =========================================================
   4️⃣ SMART SEEDING (DYNAMIC + IDEMPOTENT)
   ========================================================= */

export const seedPharmaciesIfNeeded = async (lat, lng) => {
  lat = parseFloat(lat);
  lng = parseFloat(lng);

  if (isNaN(lat) || isNaN(lng)) {
    throw new Error("Invalid coordinates");
  }

  // Ensure geospatial index exists
  await ensureGeoIndex();

  // Check total documents in DB
  const totalCount = await Pharmacy.estimatedDocumentCount();

  // If DB is empty, seed directly without geo query
  if (totalCount === 0) {
    console.log("📍 Database empty, seeding initial data...");
    const osmPharmacies = await fetchPharmaciesOSM(lat, lng);
    await saveOSM(osmPharmacies);
    return { seeded: true, reason: "db_empty", count: osmPharmacies.length };
  }

  // Use $geoWithin for counting (doesn't require sorting)
  const nearbyCount = await Pharmacy.countDocuments({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], SEED_RADIUS_METERS / 6378100], // radius in radians
      },
    },
  });

  console.log(`📊 Found ${nearbyCount} pharmacies within ${SEED_RADIUS_METERS}m`);

  // If enough data exists nearby, skip seeding
  if (nearbyCount >= MIN_PHARMACIES_THRESHOLD) {
    return {
      seeded: false,
      reason: "enough_data",
      count: nearbyCount,
    };
  }

  // Seed new area
  console.log("🌱 Seeding new area...");
  const osmPharmacies = await fetchPharmaciesOSM(lat, lng);
  await saveOSM(osmPharmacies);

  return {
    seeded: true,
    reason: "new_area",
    count: osmPharmacies.length,
  };
};

/* =========================================================
   HELPER: NORMALIZE PHARMACY CHAIN NAME
   ========================================================= */

const normalizeChainName = {
  $toLower: {
    $trim: {
      input: {
        $replaceAll: {
          input: "$name",
          find: "pharmacy",
          replacement: "",
        },
      },
    },
  },
};

/* =========================================================
   5️⃣ NEAREST PHARMACY PER CHAIN
   ========================================================= */

// export const getNearestPharmaciesByChain = async (req, res) => {
//   try {
//     const lat = parseFloat(req.query.lat);
//     const lng = parseFloat(req.query.lng);
//     const radius = parseInt(req.query.radius) || SEED_RADIUS_METERS;

//     if (isNaN(lat) || isNaN(lng)) {
//       return res.status(400).json({ message: "Valid lat & lng required" });
//     }

//     // Ensure data is seeded
//     const seedResult = await seedPharmaciesIfNeeded(lat, lng);
//     console.log("Seed result:", seedResult);

//     const pharmacies = await Pharmacy.aggregate([
//       {
//         $geoNear: {
//           near: {
//             type: "Point",
//             coordinates: [lng, lat],
//           },
//           distanceField: "distance",
//           maxDistance: radius,
//           spherical: true,
//         },
//       },
//       {
//         $addFields: { normalizedName: normalizeChainName },
//       },
//       {
//         $sort: { distance: 1 },
//       },
//       {
//         $group: {
//           _id: "$normalizedName",
//           pharmacy: { $first: "$$ROOT" },
//         },
//       },
//       { $replaceRoot: { newRoot: "$pharmacy" } },
//       {
//         $project: {
//           name: 1,
//           address: 1,
//           discountPercent: 1,
//           distance: 1,
//           location: 1,
//           isOpen: 1,
//         },
//       },
//     ]);

//     res.json({
//       success: true,
//       count: pharmacies.length,
//       seedInfo: seedResult,
//       pharmacies,
//     });
//   } catch (err) {
//     console.error("❌ Error in getNearestPharmaciesByChain:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch nearest pharmacies",
//       error: err.message,
//     });
//   }
// };
export const getNearestPharmaciesByChain = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius) || SEED_RADIUS_METERS;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat & lng required" });
    }

    // Ensure data is seeded
    const seedResult = await seedPharmaciesIfNeeded(lat, lng);
    // console.log("Seed result:", seedResult);

    const pharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance",
          maxDistance: radius,
          spherical: true,
        },
      },
      {
        $addFields: { normalizedName: normalizeChainName },
      },
      {
        $sort: { distance: 1 },
      },
      {
        $group: {
          _id: "$normalizedName",
          pharmacy: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$pharmacy" } },
      {
        $sort: { distance: 1 }, // 👈 ADD THIS - Re-sort by distance after grouping
      },
      {
        $project: {
          name: 1,
          address: 1,
          discountPercent: 1,
          distance: 1,
          location: 1,
          isOpen: 1,
        },
      },
    ]);

    res.json({
      success: true,
      count: pharmacies.length,
      seedInfo: seedResult,
      pharmacies,
    });
  } catch (err) {
    console.error("❌ Error in getNearestPharmaciesByChain:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearest pharmacies",
      error: err.message,
    });
  }
};

/* =========================================================
   6️⃣ BEST DISCOUNT (SORTED BY DISCOUNT)
   ========================================================= */

export const getPharmaciesByBestDiscount = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius) || SEED_RADIUS_METERS;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat & lng required" });
    }

    // Ensure data is seeded
    const seedResult = await seedPharmaciesIfNeeded(lat, lng);
    // console.log("Seed result:", seedResult);

    const pharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance",
          maxDistance: radius,
          spherical: true,
        },
      },
      {
        $sort: { discountPercent: -1, distance: 1 },
      },
      {
        $project: {
          name: 1,
          address: 1,
          discountPercent: 1,
          distance: 1,
          location: 1,
          isOpen: 1,
        },
      },
    ]);

    res.json({
      success: true,
      count: pharmacies.length,
      seedInfo: seedResult,
      pharmacies,
    });
  } catch (err) {
    console.error("❌ Error in getPharmaciesByBestDiscount:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch best discount pharmacies",
      error: err.message,
    });
  }
};

/* =========================================================
   7️⃣ NEARBY + BEST DISCOUNT (RECOMMENDED)
   ========================================================= */

export const getNearbyBestDiscountPharmacies = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius) || SEED_RADIUS_METERS;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat & lng required" });
    }

    // Ensure data is seeded
    const seedResult = await seedPharmaciesIfNeeded(lat, lng);
    // console.log("Seed result:", seedResult);

    const pharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance",
          maxDistance: radius,
          spherical: true,
        },
      },
      {
        $addFields: { normalizedName: normalizeChainName },
      },
      {
        $sort: { distance: 1 },
      },
      {
        $group: {
          _id: "$normalizedName",
          pharmacy: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$pharmacy" } },
      {
        $sort: { discountPercent: -1, distance: 1 },
      },
      {
        $project: {
          name: 1,
          address: 1,
          discountPercent: 1,
          distance: 1,
          location: 1,
          isOpen: 1,
        },
      },
    ]);

    res.json({
      success: true,
      count: pharmacies.length,
      seedInfo: seedResult,
      pharmacies,
    });
  } catch (err) {
    console.error("❌ Error in getNearbyBestDiscountPharmacies:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommended pharmacies",
      error: err.message,
    });
  }
};
