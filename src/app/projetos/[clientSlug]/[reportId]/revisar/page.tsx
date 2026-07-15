import { notFound } from "next/navigation";
import { getClientBySlug, getReportById } from "@/db/queries";
import type { ReportBody } from "@/lib/report-html";
import ReportForm from "./report-form";

export const dynamic = "force-dynamic";

export default async function RevisarPage({
  params,
}: {
  params: { clientSlug: string; reportId: string };
}) {
  const client = await getClientBySlug(params.clientSlug);
  if (!client) notFound();

  const report = await getReportById(params.reportId);
  if (!report || report.clientId !== client.id) notFound();

  return (
    <ReportForm
      client={{
        slug: client.slug,
        name: client.name,
        niche: client.niche,
        instagramHandle: client.instagramHandle,
      }}
      report={{
        id: report.id,
        periodSlug: report.periodSlug,
        periodLabel: report.periodLabel,
        status: report.status as "draft" | "published",
        data: report.data as ReportBody,
      }}
    />
  );
}
