const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food",
        "Travel",
        "Shopping",
        "Bills",
        "Salary",
        "Entertainment",
        "Health",
        "Education",
        "Investment",
        "Other",
      ],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [100, "Description too long"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, "Note too long"],
    },
    tags: {
      type: [String],
      default: [],
    },
    receiptDataUrl: {
      type: String,
      default: "",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurring: {
      frequency: {
        type: String,
        enum: ["weekly", "monthly", "yearly"],
      },
      nextRunDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
    sourceRecurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  { timestamps: true }
);

// Index for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, tags: 1 });
transactionSchema.index({ user: 1, isRecurring: 1, "recurring.nextRunDate": 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
