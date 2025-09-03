import {
  ActivityData,
  AnnouncementData,
  AnnouncementDetailData,
  FinanceData,
  GalleryData,
  ArticleData,
} from "@/lib/googleSheets";
import { NextRequest, NextResponse } from "next/server";
import { parseCurrency, formatCurrency, parseDate } from "../../utils/currency";

const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const FINANCE_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_FINANCE_SPREADSHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

function formatDateToIndonesian(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// --- Parsing functions ---
function parseRowToAnnouncement(row: string[]) {
  return {
    id: row[0] || "",
    title: row[1] || "",
    content: row[2] || "",
    category: (row[3] as "urgent" | "info" | "event") || "info",
    startDate: row[4] || "",
    endDate: row[5] || "",
    isActive: row[6]?.toLowerCase() === "true",
    buttonText: row[7] || "",
    buttonLink: row[8] || "",
  };
}

function parseRowToGallery(row: string[]) {
  return {
    id: row[0] || "",
    title: row[1] || "",
    imageUrl: row[2] || "",
    description: row[3] || "",
    category: row[4] || "",
    date: row[5] || "",
    isActive: row[6]?.toLowerCase() === "true",
  };
}

function parseRowToActivity(row: string[]) {
  return {
    id: row[0] || "",
    title: row[1] || "",
    description: row[2] || "",
    category: (row[3] as "rutin" | "khusus" | "jadwal") || "rutin",
    imageUrl: row[4] || "",
    schedule: row[5] || "",
    location: row[6] || "",
    participants: row[7] || "",
    instructor: row[8] || "",
    isActive: row[9]?.toLowerCase() === "true",
  };
}

function parseRowToArticle(row: string[]) {
  return {
    id: row[0] || "",
    title: row[1] || "",
    author: row[2] || "",
    date: row[3] || "",
    category: row[4] || "",
    content: row[5] || "",
    imageUrl: row[6] || "",
    isActive: row[7]?.toLowerCase() === "true",
  };
}

function parseRowToAnnouncementDetail(row: string[]) {
  return {
    id: row[0] || "",
    title: row[1] || "",
    description: row[2] || "",
    speaker: row[3] || "",
    staff: row[4] || "",
    datetime: row[5] || "",
    location: row[6] || "",
    participants: row[7] || "",
    isActive: row[8]?.toLowerCase() === "true",
  };
}

function parseRowToFinance(row: string[], index: number) {
  const income = parseCurrency(row[2] || "0");
  const expense = parseCurrency(row[3] || "0");
  const originalDate = row[0] || "";
  const parsedDate = parseDate(originalDate);
  const formattedDate = formatDateToIndonesian(parsedDate);

  return {
    id: (index + 1).toString(),
    date: formattedDate,
    description: row[1] || "",
    income,
    expense,
    fund: (row[4] as "Ummat" | "Kas") || "Ummat",
    formattedIncome: formatCurrency(income),
    formattedExpense: formatCurrency(expense),
  };
}

// --- Sheet URL builder ---
function getSheetUrl(type: string) {
  let sheetName = "";
  let spreadsheetId = SPREADSHEET_ID;
  let range = "A:Z";
  if (type === "announcement") sheetName = "Pengumuman";
  else if (type === "gallery") sheetName = "Galeri";
  else if (type === "activity") sheetName = "Kegiatan";
  else if (type === "article") sheetName = "Artikel";
  else if (type === "announcement-detail") sheetName = "Detail_Pengumuman";
  else if (type === "finance") {
    sheetName = "Dashboard";
    spreadsheetId = FINANCE_SPREADSHEET_ID;
    range = "A:E";
  }
  return `${BASE_URL}/${spreadsheetId}/values/${encodeURIComponent(
    sheetName
  )}!${range}?key=${API_KEY}`;
}

// --- Main API handler ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  if (!type)
    return NextResponse.json({ error: "Missing type" }, { status: 400 });

  if (!API_KEY || !SPREADSHEET_ID) {
    return NextResponse.json(
      { error: "Missing API key or spreadsheet ID" },
      { status: 500 }
    );
  }

  try {
    const url = getSheetUrl(type);
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch sheet" },
        { status: res.status }
      );
    }
    const data = await res.json();
    const rows = Array.isArray(data.values) ? data.values.slice(1) : [];

    // Filtering & parsing
    if (type === "announcement") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parsed = rows
        .map(parseRowToAnnouncement)
        .filter(
          (a: AnnouncementData) =>
            a.isActive &&
            (!a.endDate || parseDate(a.endDate).getTime() >= today.getTime())
        );
      return NextResponse.json({ values: parsed });
    }

    if (type === "gallery") {
      const parsed = rows
        .map(parseRowToGallery)
        .filter((g: GalleryData) => g.isActive);
      return NextResponse.json({ values: parsed });
    }
    if (type === "activity") {
      const parsed = rows
        .map(parseRowToActivity)
        .filter((act: ActivityData) => act.isActive);
      return NextResponse.json({ values: parsed });
    }
    if (type === "article") {
      const parsed = rows
        .map(parseRowToArticle)
        .filter((article: ArticleData) => article.isActive);
      return NextResponse.json({ values: parsed });
    }

    if (type === "announcement-detail") {
      const parsed = rows.map(parseRowToAnnouncementDetail);
      return NextResponse.json({ values: parsed });
    }

    if (type === "finance") {
      const parsed = rows
        .map((row: string[], idx: number) => parseRowToFinance(row, idx))
        .filter((f: FinanceData) => f.fund === "Ummat");
      return NextResponse.json({ values: parsed });
    }

    // Default: return raw values
    return NextResponse.json({ values: rows });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
