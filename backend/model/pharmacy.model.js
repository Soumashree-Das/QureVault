import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// // v1
// const pharmacySchema = new mongoose.Schema({
//   name: String,
//   address: String,

//   location: {
//     type: {
//       type: String,
//       enum: ["Point"],
//       default: "Point"
//     },
//     coordinates: {
//       type: [Number], // [lng, lat]
//       required: true
//     }
//   },

//   avgPrice: Number, // avg prescription cost
//   isOpen: Boolean
// });

// pharmacySchema.index({ location: "2dsphere" });


// // v2
// const pharmacySchema = new mongoose.Schema({
//   name: String,
//   address: String,

//   location: {
//     type: {
//       type: String,
//       enum: ["Point"],
//       default: "Point"
//     },
//     coordinates: {
//       type: [Number],
//       required: true
//     }
//   },

//   basePrice: {
//     type: Number,
//     default: 200
//   },

//   discountPercent: {
//     type: Number,
//     default: 0
//   },

//   isOpen: Boolean
// });

// v3
const pharmacySchema = new mongoose.Schema({
  name: String,
  address: String,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  

  discountPercent: {
    type: Number, // e.g. 10, 20, 35
    required: true
  },

  isOpen: Boolean
});

pharmacySchema.index({ location: "2dsphere" });
pharmacySchema.index(
  { "location.coordinates": 1 },
  { unique: true }
);


export default mongoose.model("Pharmacy", pharmacySchema);