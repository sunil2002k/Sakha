import mongoose from "mongoose";

const fundingSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },
  pidx: { type: String, unique: true },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FundedProject",
    required: true,
  },
  amount: { type: Number, required: true },
  dataFromVerificationReq: { type: Object },
  apiQueryFromUser: { type: Object },
  paymentGateway: {
    type: String,
    enum: ["khalti", "esewa", "connectIps"],
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "pending", "failed"],
    default: "pending",
  },
  paymentDate: { type: Date, default: Date.now },
 },
  { timestamps: true });

  

  const Funding = mongoose.model('Funding', fundingSchema);
  export default Funding;
