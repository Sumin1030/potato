import MainPage from "@/views/main/ui/MainPage";
import { getLatestDailyRecordDate } from "@/views/main/api/get-latest-daily-record-date";

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const requestedDate = (await searchParams).date;
  let date = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : undefined;

  if (!date) {
    const { data, error } = await getLatestDailyRecordDate();
    if (error) console.error("최근 운동 기록 날짜 조회 실패:", error);
    date = data
      ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(data.date))
      : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  }

  return <MainPage date={date} />;
}
