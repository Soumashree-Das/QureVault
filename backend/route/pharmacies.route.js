// import { Router } from "express";
// import { 
//     // getNearbyPharmacies,
//     fetchPharmaciesOSM,
//     saveOSMPharmacies,
//     getPharmaciesByBestDiscount,
//     getNearbyBestDiscountPharmacies,
// getNearestPharmaciesByChain
//  } from "../controller/pharmacy.controller.js";

// const router = Router();

// router.get("/seed-osm", async (req, res) => {
//   const { lat, lng } = req.query;

//   const places = await fetchPharmaciesOSM(lat, lng);
//   await saveOSMPharmacies(places);

//   res.json({ message: "Pharmacies seeded successfully" });
// });

// // router.get("/nearby", getNearbyPharmacies);
// router.get("/lowest-cost", getPharmaciesByBestDiscount);
// router.get(
//   "/nearby-best-discount",
//   getNearbyBestDiscountPharmacies
// );
// router.get(
//   "/nearest-branches",
//   getNearestPharmaciesByChain
// );


// // router.get("/lowest-cost", getPharmaciesByLowestCost);

// export default router;

import { Router } from "express";

import {
  fetchPharmaciesOSM,
  seedPharmaciesIfNeeded,
  getPharmaciesByBestDiscount,
  getNearbyBestDiscountPharmacies,
  getNearestPharmaciesByChain
} from "../controller/pharmacy.controller.js";

const router = Router();

/* =========================================================
   DEV / ADMIN: MANUAL SEED (OPTIONAL)
   ========================================================= */

router.get("/seed-osm", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "lat & lng required" });
  }

  // Force seeding for this location
  const result = await seedPharmaciesIfNeeded(lat, lng);

  res.json({
    message: "Seeding completed",
    ...result
  });
});

/* =========================================================
   USER-FACING ROUTES
   ========================================================= */

// 🔹 Nearest pharmacy per chain
router.get("/nearest-branches", getNearestPharmaciesByChain);

// 🔹 Best discount nearby (no chain grouping)
router.get("/lowest-cost", getPharmaciesByBestDiscount);

// 🔹 Recommended: nearest branch + best discount
router.get("/nearby-best-discount", getNearbyBestDiscountPharmacies);

export default router;
