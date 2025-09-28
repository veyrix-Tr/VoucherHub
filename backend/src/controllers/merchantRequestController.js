import { ethers } from "ethers";
import MerchantRequest from "../models/MerchantRequest.js";

export const createRequest = async (req, res) => {
  try {
    const { address, name, details } = req.body;

    if (!address || !name || !details) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await MerchantRequest.findOne({ address }) || await MerchantRequest.findOne({ name });
    if (existing) {
      if (existing.status === "approved") {
        return res.status(400).json({ error: "Merchant already approved", message: existing });
      } else if (existing.status === "pending") {
        return res.status(400).json({ error: "Request already submitted", message: existing });
      } else if (existing.status === "rejected") {
        return res.status(400).json({ error: "Request have been rejected", message: existing });
      }
    }

    const request = new MerchantRequest({ address, name, details });
    await request.save();
    res.status(201).json(request);

  } catch (err) {
    console.error("createRequest error: ", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyRequest = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: "Address required" });
    }

    const request = await MerchantRequest.findOne({ address });
    if (!request) {
      return res.status(404).json({ error: "No request found" });
    }
    res.json(request);

  } catch (err) {
    console.error("getMyRequest error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const requests = await MerchantRequest.find(filter)
      .sort({ createdAt: -1 });
    res.json(requests);

  } catch (err) {
    console.error("getAllRequests error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { txHash } = req.body;
    if (!txHash) {
      return res.status(400).json({ error: "txHash required" });
    }

    const request = await MerchantRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "approved";
    request.txHash = txHash;
    await request.save();

    res.json({
      message: "Merchant approved",
      id: request._id,
      status: request.status,
      txHash: request.txHash,
    });
  } catch (err) {
    console.error("approveRequest error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const rejectRequest = async (req, res) => {
  try {
    const { notes } = req.body;
    const request = await MerchantRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    request.status = "rejected";
    request.notes = notes || "";
    await request.save();

    res.json({ message: "Merchant rejected", request });
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
