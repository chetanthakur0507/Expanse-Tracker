const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/authMiddleware");

// All routes protected
router.use(protect);

const normalizeTags = (rawTags) => {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) {
    return [...new Set(rawTags.map((tag) => String(tag).trim()).filter(Boolean))];
  }
  if (typeof rawTags === "string") {
    return [...new Set(rawTags.split(",").map((tag) => tag.trim()).filter(Boolean))];
  }
  return [];
};

const addByFrequency = (date, frequency) => {
  const next = new Date(date);
  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  else if (frequency === "yearly") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
};

const syncRecurringForUser = async (userId) => {
  const now = new Date();
  const recurringTemplates = await Transaction.find({
    user: userId,
    isRecurring: true,
    "recurring.nextRunDate": { $lte: now },
  });

  let created = 0;

  for (const template of recurringTemplates) {
    let guard = 0;
    let nextRun = template.recurring?.nextRunDate;
    const frequency = template.recurring?.frequency || "monthly";
    const endDate = template.recurring?.endDate;

    while (nextRun && nextRun <= now && guard < 120) {
      if (endDate && nextRun > endDate) break;

      await Transaction.create({
        user: template.user,
        type: template.type,
        amount: template.amount,
        category: template.category,
        description: template.description,
        date: nextRun,
        note: template.note,
        tags: template.tags,
        receiptDataUrl: template.receiptDataUrl,
        isRecurring: false,
        sourceRecurringId: template._id,
      });

      created += 1;
      nextRun = addByFrequency(nextRun, frequency);
      guard += 1;
    }

    template.recurring.nextRunDate = nextRun;
    await template.save();
  }

  return created;
};

// @route   POST /api/transactions/recurring/sync
// @desc    Generate due recurring transactions for current user
// @access  Private
router.post("/recurring/sync", async (req, res) => {
  try {
    const created = await syncRecurringForUser(req.user._id);
    res.json({ created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions (with filters)
// @access  Private
router.get("/", async (req, res) => {
  try {
    const { type, category, month, year, search, tag, limit = 50, page = 1 } = req.query;

    let query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (search) query.description = { $regex: search, $options: "i" };
    if (tag) query.tags = tag;

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const skip = (page - 1) * limit;
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/transactions
// @desc    Add new transaction
// @access  Private
router.post("/", async (req, res) => {
  try {
    const { type, amount, category, description, date, note, tags, receiptDataUrl, isRecurring, recurring } = req.body;

    if (!type || !amount || !category || !description) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (isRecurring && (!recurring?.frequency || !recurring?.nextRunDate)) {
      return res.status(400).json({ message: "Recurring frequency and next run date are required" });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: date || Date.now(),
      note,
      tags: normalizeTags(tags),
      receiptDataUrl: receiptDataUrl || "",
      isRecurring: Boolean(isRecurring),
      recurring: isRecurring
        ? {
            frequency: recurring.frequency,
            nextRunDate: recurring.nextRunDate,
            endDate: recurring.endDate || undefined,
          }
        : undefined,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const payload = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body, "tags")) {
      payload.tags = normalizeTags(req.body.tags);
    }

    if (payload.isRecurring && (!payload.recurring?.frequency || !payload.recurring?.nextRunDate)) {
      return res.status(400).json({ message: "Recurring frequency and next run date are required" });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transactions/analytics/summary
// @desc    Get income/expense summary
// @access  Private
router.get("/analytics/summary", async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateFilter = {};

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      dateFilter = { $gte: start, $lte: end };
    }

    const matchStage = { user: req.user._id };
    if (dateFilter.$gte) matchStage.date = dateFilter;

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = summary.find((s) => s._id === "income") || { total: 0, count: 0 };
    const expense = summary.find((s) => s._id === "expense") || { total: 0, count: 0 };

    res.json({
      income: income.total,
      expense: expense.total,
      balance: income.total - expense.total,
      incomeCount: income.count,
      expenseCount: expense.count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transactions/analytics/by-category
// @desc    Get expenses grouped by category
// @access  Private
router.get("/analytics/by-category", async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateFilter = {};

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      dateFilter = { $gte: start, $lte: end };
    }

    const matchStage = { user: req.user._id, type: "expense" };
    if (dateFilter.$gte) matchStage.date = dateFilter;

    const categories = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transactions/analytics/monthly
// @desc    Get monthly income/expense for last 6 months
// @access  Private
router.get("/analytics/monthly", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const data = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
