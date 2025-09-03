import { NFTStorage } from 'nft.storage';

const NFT_STORAGE_KEY = import.meta.env.VITE_NFT_STORAGE_KEY;

if (!NFT_STORAGE_KEY) {
  console.warn("VITE_NFT_STORAGE_KEY is not set. IPFS uploads will fail.");
}

const client = new NFTStorage({ token: NFT_STORAGE_KEY });

export async function uploadImage(file) {
  try {
    const cid = await client.storeBlob(file);
    return `ipfs://${cid}`;
  } catch (err) {
    console.error("uploadImage error:", err);
    throw err;
  }
}

export async function uploadMetadata(metadata, imageFile) {
  try {
    const stored = await client.store({
      name: metadata.name,
      description: metadata.description,
      image: imageFile,
      properties: metadata.properties || {}
    });
    return stored.url;
  } catch (err) {
    console.error("uploadMetadata error:", err);
    throw err;
  }
}
