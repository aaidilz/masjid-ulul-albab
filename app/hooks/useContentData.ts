import { useState, useEffect } from "react";
import {
  googleSheetsService,
  AnnouncementData,
  GalleryData,
  ActivityData,
  ArticleData,
} from "../../lib/googleSheets";

export function useContentData() {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  const fetchContentData = async () => {
    try {
      setLoadingContent(true);
      const [announcementsData, galleryData, activitiesData, articlesData] =
        await Promise.all([
          googleSheetsService.getAnnouncements(),
          googleSheetsService.getGalleryItems(),
          googleSheetsService.getActivities(),
          googleSheetsService.getArticles(),
        ]);

      setAnnouncements(announcementsData);
      setGalleryItems(galleryData);
      setActivities(activitiesData);
      setArticles(articlesData);
    } catch (error) {
      console.error("❌ fetchContentData error:", error);

      // Set fallback data
      setAnnouncements([
        {
          id: "1",
          title: "Pengumuman Penting",
          content:
            "Pendaftaran Peserta Kajian Rutin Ahad Pagi dibuka mulai tanggal 1 Juni 2023",
          category: "info",
          startDate: "2023-01-01",
          endDate: "2023-12-31",
          isActive: true,
          buttonText: "Daftar Sekarang",
          buttonLink: "#activities",
        },
      ]);
      setGalleryItems([]);
      setActivities([]);
      setArticles([]);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchContentData();
  }, []);

  return {
    announcements,
    galleryItems,
    activities,
    articles,
    loadingContent,
    refetch: fetchContentData,
  };
}
