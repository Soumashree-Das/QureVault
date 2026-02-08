import mongoose from "mongoose";

// v4
const ReportSchema = new mongoose.Schema({
  file_public_id: { type: String, required: true },

  report_name: {
    type: String,
    required: true,
    trim: true
  },

  report_type: {
    type: String,
    required: true, // ✅ mandatory now
    enum: [
      "USG",
      "ECG",
      "ECHO",
      "BLOOD_TEST",
      "URINE_TEST",
      "XRAY",
      "MRI",
      "CT",
      "PRESCRIPTION",
      "DISCHARGE_SUMMARY",
      "VITALS",
      "OTHER"
    ]
  },

  values: {
    type: Object
  },

  upload_date: {
    type: Date,
    default: Date.now
  },

  document_date: {
    type: Date,
    required: true // ✅ must be confirmed before submit
  },

  date_source: {
    type: String,
    enum: ["ocr", "manual"],
    default: "ocr"
  }
},{
  strict: 'throw',
  timestamps: true  
});

// v3 
const PrescriptionSchema = new mongoose.Schema({
  file_public_id: { type: String, required: true },
  // file_url: { type: String, required: true },  

  prescription_name: {
    type: String,
    required: true,      // ✅ mandatory
    trim: true
  },

  extracted_text: { type: String },

  medicine_list: { type: [String], default: [] },

  upload_date: { type: Date, default: Date.now },

  document_date: { type: Date , required:true},

  date_source: {
    type: String,
    enum: ["ocr", "manual"],
    default: "ocr"
  }
});





// Main Patient schema (simplified)
const PatientSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     name: {
      type: String,
      trim: true,
      default: ""   // NOT required
    },
    age: { type: Number },
    gender: { type: String },
    blood_group: { type: String },
    qr_code: { type: String, unique: true },

    // Directly store prescriptions and reports under the patient
    prescriptions: { type: [PrescriptionSchema], default: [] },
    reports: { type: [ReportSchema], default: [] },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", PatientSchema);
export default Patient;























// import mongoose from "mongoose";

// // Sub-schema for Report
// const ReportSchema = new mongoose.Schema({
//   file_url: { type: String, required: true },
//   // extracted_text: { type: String },
//   report_type: { type: String },
//   values: { type: Object },
//   upload_date: { type: Date, default: Date.now },
//   // source: { type: String, enum: ["manual", "ocr"], default: "ocr" },
//   // confidence_score: { type: Number }
// });

// // Sub-schema for Prescription
// const PrescriptionSchema = new mongoose.Schema({
//   file_url: { type: String, required: true },
//   extracted_text: { type: String },
//   medicine_list: { type: [String], default: [] },
//   upload_date: { type: Date, default: Date.now },
//   source: { type: String, enum: ["manual", "ocr"], default: "ocr" }
// });

// // Sub-schema for Visit
// const VisitSchema = new mongoose.Schema({
//   date: { type: Date, required: true },
//   doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   disease_name: { type: String },
//   prescriptions: { type: [PrescriptionSchema], default: [] },
//   reports: { type: [ReportSchema], default: [] },
//   notes: { type: String }
// });

// // Main Patient schema
// const PatientSchema = new mongoose.Schema(
//   {
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     age: { type: Number },
//     gender: { type: String },
//     blood_group: { type: String },
//     qr_code: { type: String, unique: true },
//     visits: { type: [VisitSchema], default: [] },
//     prescriptions: { type: [PrescriptionSchema], default: [] },
//     reports: { type: [ReportSchema], default: [] },
//   },
//   { timestamps: true } // adds createdAt and updatedAt automatically
// );

// const Patient = mongoose.model("Patient", PatientSchema);

// export default Patient;
