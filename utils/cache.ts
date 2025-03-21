import fs from "fs/promises";
import path from "path";

interface CacheData {
  data: any;
  timestamp: number;
}

export async function getCachedData(filename: string, expirationDays = 30) {
  const cacheDir = path.join(process.cwd(), "cache");
  const filePath = path.join(cacheDir, filename);

  try {
    // Create cache directory if it doesn't exist
    await fs.mkdir(cacheDir, { recursive: true });

    // Try to read existing cache
    const fileContent = await fs.readFile(filePath, "utf-8");
    const cache: CacheData = JSON.parse(fileContent);

    // Check if cache is expired (30 days)
    const now = Date.now();
    const isExpired =
      now - cache.timestamp > expirationDays * 24 * 60 * 60 * 1000;

    if (isExpired) {
      return null;
    }

    return cache.data;
  } catch (error) {
    return null;
  }
}

export async function setCachedData(filename: string, data: any) {
  const cacheDir = path.join(process.cwd(), "cache");
  const filePath = path.join(cacheDir, filename);

  const cacheData: CacheData = {
    data,
    timestamp: Date.now(),
  };

  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
}
