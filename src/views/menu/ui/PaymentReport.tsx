import { forwardRef } from "react";

import type { PaymentReportData } from "../api/get-payment-report";

interface PaymentReportProps {
  report: PaymentReportData;
}

const cellClass = "border border-[#78836d] px-2 py-1.5 text-center align-middle";
const headingClass = `${cellClass} bg-[#e6efd5] font-bold`;

function formatFee(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}

function formatRecordDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
  }).format(new Date(value)).replaceAll(". ", "/").replace(".", "");
}

function getMemberDiscounts(report: PaymentReportData, memberId: number) {
  const id = String(memberId);
  return report.records.flatMap((record) => record.discounts.filter((discount) => discount.member_ids.includes(id)));
}

export const PaymentReport = forwardRef<HTMLDivElement, PaymentReportProps>(function PaymentReport({ report }, ref) {
  const recordSlots = Array.from({ length: Math.max(4, report.records.length) }, (_, index) => report.records[index] ?? null);
  const memberNames = new Map(report.members.map((member) => [String(member.id), member.name]));
  const discountTypes = Array.from(
    new Map(report.records.flatMap((record) => record.discounts).map((discount) => [discount.discount_type_id, discount])).values(),
  );
  const paidFees = report.members.map((member) => {
    const discountTotal = getMemberDiscounts(report, member.id).reduce((sum, discount) => sum + discount.amount, 0);
    return member.isFixedFee ? member.membershipFee : Math.max(0, member.membershipFee - discountTotal);
  });

  return (
    <div ref={ref} className="w-[1200px] bg-white p-4 font-sans text-[14px] text-[#30352d]">
      <h1 className="border-2 border-[#78836d] py-4 text-center text-[26px] font-bold text-[#34305f]">
        {report.year}년 {report.month}월 회비 납부표
      </h1>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className={`${headingClass} w-12`}>연번</th>
            <th className={`${headingClass} w-28`}>이름</th>
            <th className={`${headingClass} w-24`}>회원 유형</th>
            {recordSlots.map((record, index) => {
              return <th key={record?.date ?? `empty-${index}`} className={`${headingClass} ${record ? "" : "bg-[#d7d7d7]"}`}>{record ? formatRecordDate(record.date) : ""}</th>;
            })}
            <th className={`${headingClass} w-28`}>기본 회비</th>
            <th className={`${headingClass} w-28 bg-[#fff4c7]`}>납부 회비</th>
          </tr>
        </thead>
        <tbody>
          {report.members.map((member, memberIndex) => {
            const memberId = String(member.id);
            return (
              <tr key={member.id}>
                <td className={cellClass}>{memberIndex + 1}</td>
                <td className={`${cellClass} font-semibold`}>{member.name}</td>
                <td className={cellClass}>{member.memberTypeName}</td>
                {recordSlots.map((record, index) => {
                  if (!record) return <td key={`empty-${index}`} className={`${cellClass} bg-[#e2e2e2]`} />;
                  const attended = record.attendanceRecords.includes(memberId);
                  return (
                    <td key={record.date} className={`${cellClass} ${attended ? "bg-[#dbeaf4]" : ""}`}>
                      {attended && <div className="font-bold">출석</div>}
                    </td>
                  );
                })}
                <td className={cellClass}>{formatFee(member.membershipFee)}</td>
                <td className={`${cellClass} bg-[#fff4c7] font-bold`}>{formatFee(paidFees[memberIndex])}</td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={3 + recordSlots.length} className={`${headingClass} text-right`}>합계</td>
            <td className={headingClass}>{formatFee(report.members.reduce((sum, member) => sum + member.membershipFee, 0))}</td>
            <td className={`${headingClass} bg-[#fff4c7]`}>{formatFee(paidFees.reduce((sum, fee) => sum + fee, 0))}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="border-x border-b border-[#78836d] bg-[#dbe8cc] py-2 text-center text-[17px] font-bold">할인 내역</h2>
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className={`${headingClass} w-40`}>할인 유형</th>
            <th className={`${headingClass} w-28`}>할인 금액</th>
            {recordSlots.map((record, index) => {
              return <th key={record?.date ?? `empty-${index}`} className={`${headingClass} ${record ? "" : "bg-[#d7d7d7]"}`}>{record ? formatRecordDate(record.date) : ""}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {discountTypes.map((discountType) => (
            <tr key={discountType.discount_type_id}>
              <td className={`${cellClass} bg-[#eef3df] font-bold`}>{discountType.name}</td>
              <td className={cellClass}>{formatFee(discountType.amount)}</td>
              {recordSlots.map((record, index) => {
                if (!record) return <td key={`empty-${index}`} className={`${cellClass} bg-[#e2e2e2]`} />;
                const discount = record.discounts.find((item) => item.discount_type_id === discountType.discount_type_id);
                const names = discount?.member_ids.map((id) => memberNames.get(id)).filter(Boolean) ?? [];
                return <td key={record.date} className={`${cellClass} bg-[#fff8dc]`}>{names.join(", ")}</td>;
              })}
            </tr>
          ))}
          {discountTypes.length === 0 && (
            <tr><td colSpan={2 + recordSlots.length} className={cellClass}>할인 내역 없음</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
});
