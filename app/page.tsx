"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import { useFinanceData } from "./hooks/useFinanceData";
import { useContentData } from "./hooks/useContentData";
import { ContactData, ContactSubmissionResponse } from "./types";
import { googleSheetsService } from "../lib/googleSheets";
import Image from "next/image";
// Interface untuk data jadwal sholat Aladhan API (Updated)
interface PrayerTime {
  date: string;
  hijriDate: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
  firstthird: string;
  lastthird: string;
}

interface AladhanCityResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
      Firstthird: string;
      Lastthird: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
          ar: string;
        };
        month: {
          number: number;
          en: string;
          ar: string;
          days: number;
        };
        year: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
      };
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
        };
        month: {
          number: number;
          en: string;
        };
        year: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
      };
    };
    meta: {
      methodName?: string;
      schoolName?: string;
      fajrDegree?: string;
      ishaDegree?: string;
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        name: string;
        params: {
          Fajr: string;
          Isha: string;
          Maghrib: string;
        };
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: {};
    };
  };
}

interface SortConfig {
  field: "date" | "description" | "income" | "expense";
  direction: "asc" | "desc";
}

// Import semua section components
import HeaderSection from "./components/section/HeaderSection";
import HeroSection from "./components/section/HeroSection";
import PrayerTimesSection from "./components/section/PrayerTimesSection";
import AnnouncementSection from "./components/section/AnnouncementSection";
import AboutSection from "./components/section/AboutSection";
import FacilitiesSection from "./components/section/FacilitiesSection";
import OrganizationSection from "./components/section/OrganizationSection";
import FinanceSection from "./components/section/FinanceSection";
import ActivitiesSection from "./components/section/ActivitiesSection";
import GallerySection from "./components/section/GallerySection";
import ArticlesSection from "./components/section/ArticlesSection";
import ContactSection from "./components/section/ContactSection";
import MapSection from "./components/section/MapSection";
import FooterSection from "./components/section/FooterSection";
import PWAInstallBanner from "./components/PWAInstallBanner";

export default function Home() {
  // Custom hooks
  const prayerTimesHook = usePrayerTimes();
  const financeHook = useFinanceData();
  const contentHook = useContentData();

  // Local state
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [activeTab, setActiveTab] = useState("rutin");
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });

  // Helper function untuk icon sorting
  const getSortIcon = (
    field: "date" | "description" | "income" | "expense"
  ) => {
    if (financeHook.financeFilter.sortField !== field) {
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="ml-1 text-gray-400 opacity-50"
        />
      );
    }

    return financeHook.financeFilter.sortDirection === "desc" ? (
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-green-600" />
    ) : (
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-green-600" />
    );
  };

  // Fungsi untuk download gambar struktur organisasi
  const downloadOrgChart = () => {
    const link = document.createElement("a");
    link.href = "/struktur-organisasi.jpg";
    link.download = "Struktur-Organisasi-DKM-Ulul-Albaab.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const namaRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjekRef = useRef<HTMLInputElement>(null);
  const pesanRef = useRef<HTMLTextAreaElement>(null);

  // Update handleContactSubmit function
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !namaRef.current ||
      !emailRef.current ||
      !subjekRef.current ||
      !pesanRef.current
    ) {
      setContactMessage({
        type: "error",
        text: "Semua field harus diisi",
      });
      return;
    }

    setContactLoading(true);
    setContactMessage(null);

    try {
      const contactData = {
        nama: namaRef.current.value,
        email: emailRef.current.value,
        subjek: subjekRef.current.value,
        pesan: pesanRef.current.value,
      };

      // Submit to Google Sheets using the service
      const result = await googleSheetsService.submitContactForm(contactData);

      if (result.success) {
        setContactMessage({
          type: "success",
          text: result.message,
        });

        // Clear form
        namaRef.current.value = "";
        emailRef.current.value = "";
        subjekRef.current.value = "";
        pesanRef.current.value = "";
      } else {
        setContactMessage({
          type: "error",
          text: result.message,
        });
      }
    } catch (error) {
      setContactMessage({
        type: "error",
        text: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
      });
    } finally {
      setContactLoading(false);
    }
  };

  // Clear contact message
  const clearContactMessage = () => {
    setContactMessage(null);
  };

  const stableFinanceFilter = useMemo(
    () => ({
      period: financeHook.financeFilter.period,
      page: financeHook.financeFilter.page,
      itemsPerPage: financeHook.financeFilter.itemsPerPage,
      sortField: financeHook.financeFilter.sortField,
      sortDirection: financeHook.financeFilter.sortDirection,
    }),
    [
      financeHook.financeFilter.period,
      financeHook.financeFilter.page,
      financeHook.financeFilter.itemsPerPage,
      financeHook.financeFilter.sortField,
      financeHook.financeFilter.sortDirection,
    ]
  );

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setInstallPrompt(null);
    }
  };

  // Filter activities berdasarkan kategori
  const getActivitiesByCategory = (category: "rutin" | "khusus" | "jadwal") => {
    return contentHook.activities.filter((activity) => activity.category === category);
  };

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    // Debounce untuk prevent rapid calls
    const timeoutId = setTimeout(() => {
      financeHook.fetchFinanceDataPaginated(stableFinanceFilter);
    }, 300); // 300ms debounce
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();

        const targetId = anchor.getAttribute("href");
        if (!targetId || !targetId.startsWith("#")) return;
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: (targetElement as HTMLElement).offsetTop - 80,
            behavior: "smooth",
          });

          // Close mobile menu if open
          if (mobileMenu) mobileMenu.classList.add("hidden");
        }
      });
    });

    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      const navLinks = document.querySelectorAll("nav a");
      let current = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
          current = section.getAttribute("id") || "";
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active-nav");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active-nav");
        }
      });
    };

    // Add passive event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // ✅ PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      // console.log("📱 PWA install prompt triggered");
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [stableFinanceFilter]);

  return (
    <>
      <HeaderSection />
      <HeroSection />
      <PrayerTimesSection
        prayerTimes={prayerTimesHook.prayerTimes}
        loading={prayerTimesHook.loading}
        error={prayerTimesHook.error}
        location={prayerTimesHook.location}
        onRefresh={prayerTimesHook.refetch} meta={{
          methodName: undefined,
          schoolName: undefined,
          fajrDegree: undefined,
          ishaDegree: undefined
        }}      />
      <AnnouncementSection
        announcements={contentHook.announcements}
        loading={contentHook.loadingContent}
      />
      <AboutSection />
      <FacilitiesSection />
      <OrganizationSection
        showOrgChart={showOrgChart}
        setShowOrgChart={setShowOrgChart}
        downloadOrgChart={downloadOrgChart}
      />
      <FinanceSection
        loadingFinance={financeHook.loadingFinance}
        financeSummary={financeHook.financeSummary}
        paginatedFinanceData={financeHook.paginatedFinanceData}
        financeFilter={financeHook.financeFilter}
        onPeriodChange={financeHook.handlePeriodChange}
        onPageChange={financeHook.handlePageChange}
        onSort={financeHook.handleSort}
        onRefresh={financeHook.handleRefreshFinance}
        getSortIcon={getSortIcon}
      />
      <ActivitiesSection
        activities={contentHook.activities}
        loading={contentHook.loadingContent}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        getActivitiesByCategory={getActivitiesByCategory}
      />
      <GallerySection
        galleryItems={contentHook.galleryItems}
        loading={contentHook.loadingContent}
        showAllGallery={showAllGallery}
        onToggleShowAll={setShowAllGallery}
      />
      <ArticlesSection
        articles={contentHook.articles}
        loading={contentHook.loadingContent}
        showAllArticles={showAllArticles}
        onToggleShowAll={setShowAllArticles}
      />
      <ContactSection
        contactLoading={contactLoading}
        contactMessage={contactMessage}
        namaRef={namaRef}
        emailRef={emailRef}
        subjekRef={subjekRef}
        pesanRef={pesanRef}
        onSubmit={handleContactSubmit}
        onClearMessage={clearContactMessage}
      />
      <MapSection />
      <FooterSection activeTab={activeTab} setActiveTab={setActiveTab} />
      <PWAInstallBanner
        showInstallBanner={showInstallBanner}
        onInstallClick={handleInstallClick}
        onDismiss={() => setShowInstallBanner(false)}
      />
    </>
  );
}
