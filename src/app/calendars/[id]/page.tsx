export const runtime = "edge";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { CalendarDetailClient } from "./client-content";

export default async function CalendarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarDetailClient calendarId={id} />
    </Suspense>
  );
}
