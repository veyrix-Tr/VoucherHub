import axios from "axios";
import { createGatewayUrl } from "./ipfs.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const fetchVouchersByStatus = async (status, setVouchers, setLoading) => {
  setLoading(true);
  try {
    const res = await axios.get(`${backendUrl}/api/vouchers?status=${status}`);
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

    setVouchers(enriched);

  } catch (err) {
    console.error("Failed to load vouchers", err);
    setVouchers([]);
  } finally {
    setLoading(false);
  }
};
