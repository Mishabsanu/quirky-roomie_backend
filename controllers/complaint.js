import ComplaintModel from "../database/schema/complaint.js";
import UserModel from "../database/schema/user.js";
import moment from "moment";
export const createComplaint = async (req, res) => {
  try {
    console.log(req, "req");

    const { title, description, type, severity } = req.body;
    const user = await UserModel.findById(req.user.id);

    const newComplaint = new ComplaintModel({
      title,
      description,
      type,
      severity,
      createdBy: user._id,
      flatCode: user.flatCode,
    });

    await newComplaint.save();

    res.status(201).json({
      status: "success",
      message: "Complaint created successfully",
      result: newComplaint,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "Server error",
      result: null,
    });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
        result: null,
      });
    }

    const complaints = await ComplaintModel.find({ flatCode: user.flatCode })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");

    res.status(200).json({
      status: "success",
      message: "Complaints fetched successfully",
      result: complaints,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "Server error",
      result: null,
    });
  }
};

export const voteComplaint = async (req, res) => {
  const { voteType } = req.body;
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const complaint = await ComplaintModel.findById(id);
    console.log(complaint);

    if (!complaint) {
      return res
        .status(404)
        .json({ status: "fail", message: "Complaint not found", result: null });
    }

    if (complaint?.isResolved) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot vote on a resolved complaint",
        result: null,
      });
    }

    // Remove vote if user already voted
    complaint.upvotes.pull(userId);
    complaint.downvotes.pull(userId);

    if (voteType === "upvote") complaint.upvotes.push(userId);
    else if (voteType === "downvote") complaint.downvotes.push(userId);

    await complaint.save();

    return res.status(200).json({
      status: "success",
      message: `Complaint ${voteType}voted successfully`,
      result: complaint,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: error.message, result: null });
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const complaint = await ComplaintModel.findById(req.params.id);
    complaint.isResolved = true;
    await complaint.save();

    const user = await UserModel.findById(req.user.id);
    user.karmaPoints += 10;
    await user.save();

    res.json({
      status: "success",
      message: "Complaint resolved successfully",
      result: { complaintId: complaint._id },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "Server error",
      result: null,
    });
  }
};

export const getWeeklyTopComplaint = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    const weekStart = moment().startOf("isoWeek").toDate();
    const weekEnd = moment().endOf("isoWeek").toDate();

    const topComplaint = await ComplaintModel.find({
      flatCode: user.flatCode,
      createdAt: { $gte: weekStart, $lte: weekEnd },
    })
      .sort({ upvotes: -1 })
      .limit(1)
      .populate("createdBy", "username");

    res.status(200).json({
      status: "success",
      message: "Top complaint of the week",
      result: topComplaint[0] || null,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await ComplaintModel.findById(req.params.id).populate(
      "createdBy",
      "username"
    );

    const upvoteCount = complaint.upvotes.length;
    let punishment = null;

    if (upvoteCount >= 10) {
      const punishments = [
        "You're making chai for everyone this week.",
        "You owe everyone samosas.",
        "You're doing dishes for 3 days straight.",
        "You’re handling garbage duty this week.",
      ];
      punishment = punishments[Math.floor(Math.random() * punishments.length)];
    }

    res.json({
      status: "success",
      message: "Complaint details retrieved",
      result: { complaint, punishment },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "Server error",
      result: null,
    });
  }
};
