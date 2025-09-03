import { useState, useEffect } from "react";
import { PrayerTime, AladhanCityResponse } from "../types/prayer";

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Bandung, Indonesia");

  const fetchPrayerTimes = async () => {
    setLoading(true);
    setError(null);

    try {
      // Format tanggal: DD-MM-YYYY
      const currentDate = new Date();
      const dateString = `${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${currentDate.getFullYear()}`;

      // Parameter Bandung, Indonesia
      const params = new URLSearchParams({
        latitude: "-6.9175",
        longitude: "107.6191",
        method: "20", // KEMENAG Indonesia
        school: "0", // Shafi
        tune: "0,0,0,0,0,0,0,0,0",
        timezonestring: "Asia/Jakarta",
      });

      const url = `https://api.aladhan.com/v1/timings/${dateString}?${params.toString()}`;

      // Timeout handler
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AladhanCityResponse = await response.json();

      if (data.code === 200 && data.data && data.data.timings) {
        const timings = data.data.timings;
        const date = data.data.date;

        // Format tanggal Gregorian Indonesia
        const dayNames = {
          Sunday: "Minggu",
          Monday: "Senin",
          Tuesday: "Selasa",
          Wednesday: "Rabu",
          Thursday: "Kamis",
          Friday: "Jumat",
          Saturday: "Sabtu",
        };
        const monthNames = [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];
        const dayName =
          dayNames[date.gregorian.weekday.en as keyof typeof dayNames];
        const monthName = monthNames[date.gregorian.month.number - 1];
        const formattedDate = `${dayName}, ${date.gregorian.day} ${monthName} ${date.gregorian.year}`;

        // Format tanggal Hijriah Indonesia
        const hijriMonthNames = {
          Muharram: "Muharram",
          Safar: "Safar",
          "Rabi' al-awwal": "Rabiul Awwal",
          "Rabi' al-thani": "Rabiul Akhir",
          "Jumada al-awwal": "Jumadil Awwal",
          "Jumada al-thani": "Jumadil Akhir",
          Rajab: "Rajab",
          "Sha'ban": "Syaban",
          Ramadan: "Ramadhan",
          Shawwal: "Syawal",
          "Dhu al-Qi'dah": "Dzulqaidah",
          "Dhu al-Hijjah": "Dzulhijjah",
        };

        // Offset -1 hari Hijriah
        let hijriDay = parseInt(date.hijri.day, 10) - 1;
        let hijriMonth = date.hijri.month.en;
        let hijriYear = date.hijri.year;

        // Handle month transition
        if (hijriDay < 1) {
          // Get previous month
          const prevMonthIndex = date.hijri.month.number - 2; // 0-based
          if (prevMonthIndex >= 0) {
            const monthKeys = Object.keys(hijriMonthNames) as (keyof typeof hijriMonthNames)[];
            hijriMonth = hijriMonthNames[monthKeys[prevMonthIndex]];
            // Assume 30 days for previous month
            hijriDay = 30 + hijriDay;
          } else {
            // Previous year
            hijriYear = (parseInt(hijriYear, 10) - 1).toString();
            hijriMonth = "Dhu al-Hijjah";
            hijriDay = 30 + hijriDay;
          }
        } else {
          hijriMonth = hijriMonthNames[hijriMonth as keyof typeof hijriMonthNames] || hijriMonth;
        }

        const formattedHijriDate = `${hijriDay} ${hijriMonth} ${hijriYear} H`;

        // Set prayer times
        setPrayerTimes({
          date: formattedDate,
          hijriDate: formattedHijriDate,
          fajr: timings.Fajr,
          sunrise: timings.Sunrise,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          sunset: timings.Sunset,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
          imsak: timings.Imsak,
          midnight: timings.Midnight,
          firstthird: timings.Firstthird,
          lastthird: timings.Lastthird,
        });
      } else {
        throw new Error("Invalid response from prayer times API");
      }
    } catch (err) {
      console.error("Error fetching prayer times:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch prayer times");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  return {
    prayerTimes,
    loading,
    error,
    location,
    setLocation,
    refetch: fetchPrayerTimes,
  };
}
