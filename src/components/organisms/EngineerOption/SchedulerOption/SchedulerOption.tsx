"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";
import {
  createScheduler,
  getScheduler,
  getSchedulerAttendance,
  getSchedulerList,
  postSchedulerAttendance,
} from "@/types/scheduler";
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
  calendarId: string;
  currentUserId: string | null;
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
  calendarId,
  currentUserId,
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

  const availabilityToStatus = (av: Availability): 1 | 2 | 3 => {
    switch (av) {
      case "ok":
        return 1;
      case "maybe":
        return 2;
      case "ng":
        return 3;
    }
  };

  const buildAttendanceStatus = (map: AvailabilityMap) =>
    Object.entries(map).map(([date, av]) => ({
      date: new Date(date).toISOString(),
      status: availabilityToStatus(av),
    }));

  useEffect(() => {
    if (viewMode === "list") {
      const fetchSchedulers = async () => {
        try {
          const data = await getSchedulerList(calendarId);
          setSchedulers(
            data.map((scheduler) => {
              return {
                id: scheduler.id,
                author: scheduler.userId,
                title: scheduler.title,
                memo: scheduler.memo,
                limitTime: scheduler.limitTime,
                createdAt: scheduler.limitTime || "",
                respondersCount: 0,
                hasResponded: scheduler.isDone,
              };
            }),
          );
        } catch (_error) {
          toast.error("スケジューラーの読み込みに失敗しました");
        }
      };
      fetchSchedulers();
    }
  }, [calendarId, viewMode]);

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
      const createdScheduler = await createScheduler(calendarId, {
        title: newSchedulerData.title,
        memo: newSchedulerData.memo,
        limitTime: newSchedulerData.limitTime,
        isAllDay: newSchedulerData.isAllDay,
        dates: newSchedulerData.dates,
      });
      try {
        await postSchedulerAttendance(calendarId, createdScheduler.schedulerId, {
          comment,
          status: buildAttendanceStatus(availability),
        });
        toast.success("スケジューラーを作成しました");
      } catch (_attendanceError) {
        toast.error(
          "出欠の送信に失敗しました。スケジューラーは作成されています。",
        );
      }
      setNewSchedulerData(null);
      setAvailability({});
      setComment("");
      setSelectedSchedulerId(createdScheduler.schedulerId); // Set the ID of the newly created scheduler
      setViewMode("summary"); // Navigate to summary of the newly created scheduler
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.message.includes("limit time must be after current time")
      ) {
        toast.error("回答締切は現在時刻より後に設定してください");
      } else {
        toast.error("スケジューラーの作成に失敗しました");
      }
    }
  };

  const handleSelectPoll = async (id: string, _hasResponded: boolean) => {
    setSelectedSchedulerId(id);
    try {
      if (currentUserId) {
        const attendance = await getSchedulerAttendance(calendarId, id);
        const hasAttendance = attendance.some(
          (entry) => entry.userId === currentUserId,
        );
        if (hasAttendance) {
          setViewMode("summary");
          return;
        }
      }
    } catch (error) {
      if (!(error instanceof ApiClientError && error.code === 404)) {
        console.error(error);
      }
    }

    // Fetch poll data to pre-fill the availability form
    try {
      const pollDetails = await getScheduler(calendarId, id);
      const dates = pollDetails.possibleDate.map((d) => {
        const startDatetime = new Date(d.startTime);
        const endDatetime = new Date(d.endTime);
        return {
          date: new Date(d.date)
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "/"),
          startTime:
            startDatetime.getHours().toString() +
            ":" +
            startDatetime.getMinutes().toString(),
          endTime:
            endDatetime.getHours().toString() +
            ":" +
            endDatetime.getMinutes().toString(),
        };
      });
      onDatesChange(dates.map((d) => d.date));
      const isAllDay = pollDetails.isAllDay;
      const defaultStartTime = isAllDay
        ? null
        : new Date(pollDetails.possibleDate[0]?.startTime);
      const defaultEndTime = isAllDay
        ? null
        : new Date(pollDetails.possibleDate[0]?.endTime);
      setNewSchedulerData({
        title: pollDetails.title,
        memo: pollDetails.memo,
        defaultStartTime: defaultStartTime
          ? defaultStartTime.getHours().toString() +
            ":" +
            defaultStartTime.getMinutes().toString()
          : "",
        defaultEndTime: defaultEndTime
          ? defaultEndTime.getHours().toString() +
            ":" +
            defaultEndTime.getMinutes().toString()
          : "",
        limitTime: null,
        isAllDay: isAllDay,
        dates: dates,
      });
      setViewMode("respond"); // A new view for responding
    } catch (err) {
      toast.error("スケジューラーの読み込みに失敗しました");
      console.error(err);
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
      await postSchedulerAttendance(calendarId, selectedSchedulerId, {
        comment,
        status: buildAttendanceStatus(availability),
      });

      toast.success("回答を送信しました");
      setAvailability({});
      setComment("");
      setViewMode("summary");
    } catch (_error) {
      toast.error("回答の送信に失敗しました。時間をおいて再度お試しください。");
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
          calendarId={calendarId}
          schedulerId={selectedSchedulerId}
          onBack={handleBackToList} // Back from summary goes to list and clears selected ID
          onConfirm={onScheduleConfirm}
        />
      )}
    </div>
  );
}
