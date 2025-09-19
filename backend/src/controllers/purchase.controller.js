import { Purchase } from "../models/purchase.model.js";

// Get all purchases for the logged-in user
export const getUserPurchases = async (req, res) => {
  const { userId } = req; // Assume populated via auth middleware
  try {
    const purchases = await Purchase.find({ userId })
      .populate("courseId", "title price")
      .sort({ purchaseDate: -1 });

    res.json({ purchases });
  } catch (err) {
    console.error("getUserPurchases error:", err);
    res.status(500).json({ errors: "Failed to fetch purchases" });
  }
};

// Get a single purchase by ID

export const getPurchaseById = async (req, res) => {
  const { id } = req.params;
  try {
    const purchase = await Purchase.findById(id).populate("courseId", "title price");
    if (!purchase) return res.status(404).json({ errors: "Purchase not found" });

    res.json({ purchase });
  } catch (err) {
    console.error("getPurchaseById error:", err);
    res.status(500).json({ errors: "Failed to fetch purchase" });
  }
};


// Admin: get all purchases

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("userId", "name email")
      .populate("courseId", "title price")
      .sort({ purchaseDate: -1 });

    res.json({ purchases });
  } catch (err) {
    console.error("getAllPurchases error:", err);
    res.status(500).json({ errors: "Failed to fetch purchases" });
  }
};


// Update purchase progress (optional: for course completion)

export const updatePurchaseProgress = async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  try {
    const purchase = await Purchase.findById(id);
    if (!purchase) return res.status(404).json({ errors: "Purchase not found" });

    purchase.progress = progress;
    await purchase.save();

    res.json({ purchase });
  } catch (err) {
    console.error("updatePurchaseProgress error:", err);
    res.status(500).json({ errors: "Failed to update progress" });
  }
};
