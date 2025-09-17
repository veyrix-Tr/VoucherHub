import { PinataSDK } from "pinata";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

if (!PINATA_JWT) {
  console.warn("VITE_PINATA_JWT is not set. IPFS uploads will fail.");
}
if (!PINATA_GATEWAY) {
  console.warn("VITE_PINATA_GATEWAY is not set. Gateway functions will fail.");
}

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});

export async function uploadImage(file) {
  try {
    const upload = await pinata.upload.public.file(file);
    return `ipfs://${upload.cid}`;
  } catch (err) {
    console.error("uploadImage error:", err);
    throw err;
  }
}

export async function uploadMetadata(metadata, imageFile) {
  try {
    const imageUrl = await uploadImage(imageFile);
    
    const completeMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: imageUrl,
      expiry: metadata.expiry,
      properties: metadata.properties
    };
    
    const metadataUpload = await pinata.upload.public.json(completeMetadata);
    return `ipfs://${metadataUpload.cid}`;
  } catch (err) {
    console.error("uploadMetadata error:", err);
    throw err;
  }
}

// For displaying images in your web app by getting gatewayUrl from cid
export async function createGatewayUrl(cid) {
  try {
    const url = await pinata.gateways.convert(cid);
    return url;
  } catch (err) {
    console.error("createGatewayUrl error:", err);
    throw err;
  }
}