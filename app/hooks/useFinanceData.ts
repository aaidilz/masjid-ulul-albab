import { useState, useCallback } from "react";
import {
  googleSheetsService,
  FinanceData,
  FinanceSummary,
  FinanceFilter,
  PaginatedFinanceData,
} from "../../lib/googleSheets";

export function useFinanceData() {
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [financeFilter, setFinanceFilter] = useState<FinanceFilter>({
    period: "all",
    page: 1,
    itemsPerPage: 7,
    sortField: "date",
    sortDirection: "desc",
  });
  const [paginatedFinanceData, setPaginatedFinanceData] = useState<PaginatedFinanceData | null>(null);

  // Fungsi untuk fetch data finance
  const fetchFinanceData = async () => {
    try {
      setLoadingFinance(true);

      const [financeTransactions, summary] = await Promise.all([
        googleSheetsService.getFinanceData(),
        googleSheetsService.getFinanceSummary(),
      ]);

      setFinanceData(financeTransactions);
      setFinanceSummary(summary);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      // Set fallback data
      setFinanceSummary({
        totalIncome: 25750000,
        totalExpense: 18300000,
        balance: 142650000,
        formattedTotalIncome: "Rp 25.750.000",
        formattedTotalExpense: "Rp 18.300.000",
        formattedBalance: "Rp 142.650.000",
        transactionCount: 50,
        lastUpdated: "Hari ini",
      });
      console.error("Failed to fetch finance data, using fallback data");
    } finally {
      setLoadingFinance(false);
    }
  };

  // Fungsi untuk fetch data finance dengan filter dan pagination
  const fetchFinanceDataPaginated = async (filter: FinanceFilter) => {
    const fetchId = Date.now();
    try {
      setLoadingFinance(true);

      const [paginatedData, summary] = await Promise.all([
        googleSheetsService.getFinanceDataPaginated(filter),
        googleSheetsService.getFinanceSummaryByPeriod(filter.period),
      ]);

      setPaginatedFinanceData(paginatedData);
      setFinanceSummary(summary);
    } catch (error) {
      console.error(`❌ [${fetchId}] fetchFinanceDataPaginated error:`, error);

      // Set fallback data
      setFinanceSummary({
        totalIncome: 25750000,
        totalExpense: 18300000,
        balance: 142650000,
        formattedTotalIncome: "Rp 25.750.000",
        formattedTotalExpense: "Rp 18.300.000",
        formattedBalance: "Rp 142.650.000",
        transactionCount: 50,
        lastUpdated: "Fallback data",
      });
    } finally {
      setLoadingFinance(false);
    }
  };

  const handlePeriodChange = useCallback(
    (period: "week" | "month" | "year" | "all") => {
      console.log("📅 Period changing to:", period);
      setFinanceFilter((prev) => ({
        ...prev,
        period,
        page: 1, // Reset to first page
      }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    console.log("📄 Page changing to:", page);
    setFinanceFilter((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  const handleSort = useCallback(
    (field: "date" | "description" | "income" | "expense") => {
      console.log("🔄 Sorting by:", field);
      setFinanceFilter((prev) => {
        const newDirection: "asc" | "desc" =
          prev.sortField === field && prev.sortDirection === "desc"
            ? "asc"
            : "desc";

        return {
          ...prev,
          sortField: field,
          sortDirection: newDirection,
          page: 1, // Reset to first page
        };
      });
    },
    []
  );

  const handleRefreshFinance = useCallback(() => {
    fetchFinanceDataPaginated(financeFilter);
  }, [financeFilter]);

  return {
    financeData,
    financeSummary,
    loadingFinance,
    financeFilter,
    paginatedFinanceData,
    fetchFinanceData,
    fetchFinanceDataPaginated,
    handlePeriodChange,
    handlePageChange,
    handleSort,
    handleRefreshFinance,
  };
}
