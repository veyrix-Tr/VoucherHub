import axios from "axios";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function fetchMerchantRequests(status, setRequests, setLoading) {
  setLoading(true);
  try {
    const url = status ? `${backendUrl}/api/merchant-requests?status=${status}` : `${backendUrl}/api/merchant-requests`;
    const res = await axios.get(url);
    const requestsData = res.data || [];
    setRequests(requestsData);

  } catch (err) {
    console.error("fetchMerchantRequests error", err);
    toast.error("fetchMerchantRequests error", err);
    setRequests([]);
  } finally {
    setLoading(false);
  }
}

export async function approveMerchantRequest(req, signer, MerchantRegistryABI, registryAddress) {

  if (!req || !req.address || !req._id || !req.name) {
    console.error("approveMerchantRequest: invalid request object", req);
    return false;
  }
  try {
    const contract = new ethers.Contract(registryAddress, MerchantRegistryABI, signer);
    const tx = await contract.registerMerchant(req.address, req.name);
    await tx.wait();

    await axios.put(`${backendUrl}/api/merchant-requests/${req._id}/approve`, {
      txHash: tx.hash,
    });

    return true;
  } catch (err) {
    console.error("approveMerchantRequest error:", err);
    toast.error("approveMerchantRequest error:", err);
    return false;
  }
}

export async function rejectMerchantRequest(reqId, notes = "") {
  if (!reqId) {
    console.error("rejectMerchantRequest: invalid id");
    return false;
  }
  try {
    await axios.put(`${backendUrl}/api/merchant-requests/${reqId}/reject`, { notes });
    return true;
  } catch (err) {
    console.error("rejectMerchantRequest error:", err);
    toast.error("rejectMerchantRequest error:", err);
    return false;
  }
}
