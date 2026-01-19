"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createSchedulerPoll,
  getSchedulerPoll,
  getSchedulerPolls,
} from "@/lib/api-scheduler-polls";
import type { SchedulerPollResponse } from "@/types/scheduler-poll";
import { SchedulerAvailability } from "./views/SchedulerAvailability";
import {
  SchedulerCreate,
  type SchedulerCreateData,
} from "./views/SchedulerCreate";
import { SchedulerList } from "./views/SchedulerList";
import { SchedulerSummary } from "./views/SchedulerSummary";

// 画面モード
export type ViewMode =
  | "list"
  | "create"
  | "availability"
  | "summary"
  | "respond";

// ◯△×
export type Availability = "ok" | "maybe" | "ng";

export type AvailabilityMap = {
  [date: string]: Availability;
};

export type Summary = {
  ok: number;
  maybe: number;
  ng: number;
};

export type SummaryMap = Record<string, Summary>;

type Props = {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  onScheduleConfirm: (data: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
};

export function SchedulerOption({
  selectedDates,
  onDatesChange,
  viewMode,
  setViewMode,
  onScheduleConfirm,
}: Props) {
  const [newSchedulerData, setNewSchedulerData] =
    useState<SchedulerCreateData | null>(null);
  const [schedulers, setSchedulers] = useState<SchedulerPollResponse[]>([]);
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [comment, setComment] = useState("");
  const [selectedSchedulerId, setSelectedSchedulerId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (viewMode === "list") {
      const fetchSchedulers = async () => {
        try {
          const data = await getSchedulerPolls();
          setSchedulers(data);
        } catch (_error) {
          toast.error("スケジューラーの読み込みに失敗しました");
        }
      };
      fetchSchedulers();
    }
  }, [viewMode]);

  // Reset to list view if state is inconsistent
  useEffect(() => {
    if (viewMode === "summary" && !selectedSchedulerId) {
      setViewMode("list");
    }
    if (viewMode === "availability" && !newSchedulerData) {
      setViewMode("list");
    }
    if (viewMode === "respond" && !selectedSchedulerId) {
      setViewMode("list");
    }
  }, [viewMode, selectedSchedulerId, newSchedulerData, setViewMode]);

  const handleCreateNext = (data: SchedulerCreateData) => {
    setNewSchedulerData(data);
    setViewMode("availability");
  };

  const handleAvailabilityNext = async () => {
    if (!newSchedulerData) return;

    try {
      const createdScheduler = await createSchedulerPoll({
        ...newSchedulerData,
        availabilities: availability,
        comment,
      });
      toast.success("スケジューラーを作成しました");
      setNewSchedulerData(null);
      setAvailability({});
      setComment("");
      setSelectedSchedulerId(createdScheduler.id); // Set the ID of the newly created scheduler
      setViewMode("summary"); // Navigate to summary of the newly created scheduler
    } catch (_error) {
      toast.error("スケジューラーの作成に失敗しました");
    }
  };

  const handleSelectPoll = async (id: string, hasResponded: boolean) => {
    setSelectedSchedulerId(id);
    if (hasResponded) {
      setViewMode("summary");
    } else {
      // Fetch poll data to pre-fill the availability form
      try {
        const pollDetails = await getSchedulerPoll(id);
        const dates = pollDetails.dates.map((d) => d.date.slice(0, 10));
        onDatesChange(dates);
        const isAllDay = !pollDetails.dates[0]?.startTime;
        setNewSchedulerData({
          title: pollDetails.title,
          memo: pollDetails.memo,
          defaultStartTime: isAllDay
            ? ""
            : pollDetails.dates[0]?.startTime || "",
          defaultEndTime: isAllDay ? "" : pollDetails.dates[0]?.endTime || "",
          limitTime: null,
          isAllDay: isAllDay,
          dates: pollDetails.dates.map((d) => ({
            date: d.date,
            startTime: d.startTime,
            endTime: d.endTime,
          })),
        });
        setViewMode("respond"); // A new view for responding
      } catch (_error) {
        toast.error("スケジューラーの読み込みに失敗しました");
      }
    }
  };

  const handleBackToCreate = () => {
    setViewMode("create");
  };

  const handleBackToList = () => {
    setNewSchedulerData(null);
    setAvailability({}); // Also clear availability when going back to list
    setComment("");
    onDatesChange([]); // Clear selected dates when going back to list
    setSelectedSchedulerId(null); // Clear selected scheduler ID
    setViewMode("list");
  };

  // Handler for submitting a response to an existing poll
  const handleRespondNext = async () => {
    if (!selectedSchedulerId) return;
    try {
  const response = await fetch(
    `/api/scheduler-polls/${encodeURIComponent(selectedSchedulerId)}/responses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        availability,
        comment,
      }),
    },
  );

  if (!response.ok) {
    toast.error("回答の送信に失敗しました。時間をおいて再度お試しください。");
    return;
  }

  toast.success("回答を送信しました");
  setAvailability({});
  setComment("");
  setViewMode("summary");
} catch (error) {
  toast.error(
    "ネットワークエラーが発生しました。接続状況を確認してください。",
  );
}
  };

  return (
    <div>
      {viewMode === "list" && (
        <SchedulerList
          onCreate={() => setViewMode("create")}
          schedulers={schedulers}
          onSelectPoll={handleSelectPoll}
        />
      )}

      {viewMode === "create" && (
        <SchedulerCreate
          initialData={newSchedulerData}
          selectedDates={selectedDates}
          setSelectedDates={onDatesChange}
          onNext={handleCreateNext}
          onBack={handleBackToList}
        />
      )}

      {(viewMode === "availability" || viewMode === "respond") &&
        newSchedulerData && (
          <SchedulerAvailability
            dates={selectedDates}
            defaultStartTime={newSchedulerData.defaultStartTime}
            defaultEndTime={newSchedulerData.defaultEndTime}
            memo={newSchedulerData.memo}
            title={newSchedulerData.title}
            availability={availability}
            onChange={setAvailability}
            comment={comment}
            onCommentChange={setComment}
            onNext={
              viewMode === "respond"
                ? handleRespondNext
                : handleAvailabilityNext
            }
            onBack={
              viewMode === "respond" ? handleBackToList : handleBackToCreate
            }
          />
        )}

      {viewMode === "summary" && selectedSchedulerId && (
        <SchedulerSummary
          schedulerId={selectedSchedulerId}
          onBack={handleBackToList} // Back from summary goes to list and clears selected ID
          onConfirm={onScheduleConfirm}
        />
      )}
    </div>
  );
}
