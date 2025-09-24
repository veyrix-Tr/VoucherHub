import axios from "axios";
import { createGatewayUrl } from "./ipfs.js";
import toast from "react-hot-toast";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const fetchVouchers = async (res) => {
  const vouchersData = res.data || [];
  const enriched = await Promise.all(
    vouchersData.map(async (v) => {
      try {
        const url = await createGatewayUrl(v.metadataCID);
        const resp = await fetch(url);
        const metadata = await resp.json();
        let imageUrl = metadata.image ? await createGatewayUrl(metadata.image) : null;
        return { ...v, metadata, imageUrl };
      } catch (err) {
        console.error("Failed to fetch metadata for", v.voucherId, err);
        return { ...v, metadata: null, imageUrl: null };
      }
    })
  );
  return enriched;
}

export const fetchVouchersByStatus = async (status, setVouchers, setLoading) => {
  setLoading(true);
  try {
    const res = await axios.get(`${backendUrl}/api/vouchers?status=${status}`);
    const enriched = await fetchVouchers(res);
    setVouchers(enriched);

  } catch (err) {
    console.error("Failed to load vouchers", err);
    toast.error("Failed to load vouchers");
    setVouchers([]);
    
  } finally {
    setLoading(false);
  }
};

export const fetchVouchersByOwner = async (owner, setVouchers, setLoading) => {
  setLoading(true);
  try {
    const res = await axios.get(`${backendUrl}/api/vouchers?owner=${owner}`);
    const enriched = await fetchVouchers(res);
    setVouchers(enriched);

  } catch (err) {
    console.error("Failed to load owner vouchers", err);
    setVouchers([]);
  } finally {
    setLoading(false);
  }
};
