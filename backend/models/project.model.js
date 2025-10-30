import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title:{
         type: String,
        required:true,
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    description: {
    type: String,
    required: true,
  },
  tech_stack: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  expected_outcomes: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['mentorship', 'funding'],
    default: 'mentorship',
    required: true,
  },
  targetAmount: {
    type: Number,
    required: function () {
      return this.type === 'funding';
    },
  },
  images:{
    type: [String],
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.models.Project || mongoose.model("Project", projectSchema);
