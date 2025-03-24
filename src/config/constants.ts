import dotenv from "dotenv";
import path from "path";

dotenv.config();
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const IAPROMPT = process.env.IAPROMPT || "";
export const SCRAPING_TIMEOUT = 90000;
export const MAX_PAGES_TO_SCRAPE = 10;
export const TARGET_URL = process.env.TARGET_URL || "";
export const MAX_PAGES = Number(process.env.MAX_PAGES) || 5;

export const BASE_URL = "https://www.tottus.com.pe";

export const DEBUG_DIR = path.join(process.cwd(), "debug");
