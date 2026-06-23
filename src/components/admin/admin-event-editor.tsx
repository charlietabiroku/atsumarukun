"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  toCandidateDateIsoFromParts,
  toDateInput,
  toTimeInput,
} from "@/lib/utils";
import { EventDetail } from "@/types/event";
import { ResponseStatus, ResponseWithItems } from "@/types/response";

type AdminEventEditorProps = {
  event: EventDetail;
  responses: ResponseWithItems[];
};

type CandidateRow = {
  id?: string;
  localId: string;
  date: string;
  time: string;
};

type ResponseRow = {
  id: string;
  name: string;
  comment: string;
  items: Record<string, ResponseStatus>;
};

const statusOptions: Array<{ value: ResponseStatus; label: string }> = [
  { value: "available", label: "○" },
  { value: "maybe", label: "△" },
  { value: "unavailable", label: "×" },
];

function createCandidateRows(event: EventDetail): CandidateRow[] {
  return event.candidateDates.map((candidate) => ({
    id: candidate.id,
    localId: candidate.id,
    date: toDateInput(candidate.candidateDate),
    time: toTimeInput(candidate.candidateDate),
  }));
}

function createResponseRows(
  event: EventDetail,
  responses: ResponseWithItems[],
): ResponseRow[] {
  return responses.map((response) => ({
    id: response.id,
    name: response.name,
    comment: response.comment ?? "",
    items: Object.fromEntries(
      event.candidateDates.map((candidate) => {
        const matched = response.items.find(
          (item) => item.eventDateId === candidate.id,
        );

        return [candidate.id, matched?.status ?? "unavailable"];
      }),
    ) as Record<string, ResponseStatus>,
  }));
}

function emptyCandidateRow(): CandidateRow {
  return {
    localId: crypto.randomUUID(),
    date: "",
    time: "",
  };
}

export function AdminEventEditor({
  event,
  responses: initialResponses,
}: AdminEventEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [language, setLanguage] = useState(event.language);
  const [responseDeadlineDate, setResponseDeadlineDate] = useState(
    event.responseDeadline ? toDateInput(event.responseDeadline) : "",
  );
  const [responseDeadlineTime, setResponseDeadlineTime] = useState(
    event.responseDeadline ? toTimeInput(event.responseDeadline) : "",
  );
  const [receptionStatus, setReceptionStatus] = useState(event.receptionStatus);
  const [shareEnabled, setShareEnabled] = useState(event.shareEnabled);
  const [candidateRows, setCandidateRows] = useState<CandidateRow[]>(
    createCandidateRows(event),
  );
  const [responses, setResponses] = useState<ResponseRow[]>(
    createResponseRows(event, initialResponses),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(event.title);
    setDescription(event.description ?? "");
    setLanguage(event.language);
    setResponseDeadlineDate(event.responseDeadline ? toDateInput(event.responseDeadline) : "");
    setResponseDeadlineTime(event.responseDeadline ? toTimeInput(event.responseDeadline) : "");
    setReceptionStatus(event.receptionStatus);
    setShareEnabled(event.shareEnabled);
    setCandidateRows(createCandidateRows(event));
    setResponses(createResponseRows(event, initialResponses));
  }, [event, initialResponses]);

  const activeCandidateIds = useMemo(
    () => candidateRows.filter((row) => row.id).map((row) => row.id as string),
    [candidateRows],
  );

  function updateCandidate(localId: string, patch: Partial<CandidateRow>) {
    setCandidateRows((current) =>
      current.map((row) =>
        row.localId === localId
          ? {
              ...row,
              ...patch,
            }
          : row,
      ),
    );
  }

  function addCandidate() {
    setCandidateRows((current) => [...current, emptyCandidateRow()]);
  }

  function removeCandidate(localId: string) {
    if (!window.confirm("この候補日を削除しますか？")) {
      return;
    }

    const removed = candidateRows.find((row) => row.localId === localId);

    setCandidateRows((current) => current.filter((row) => row.localId !== localId));

    if (removed?.id) {
      setResponses((current) =>
        current.map((response) => {
          const nextItems = { ...response.items };
          delete nextItems[removed.id as string];
          return {
            ...response,
            items: nextItems,
          };
        }),
      );
    }
  }

  function moveCandidate(localId: string, direction: -1 | 1) {
    setCandidateRows((current) => {
      const index = current.findIndex((row) => row.localId === localId);

      if (index < 0) {
        return current;
      }

      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function saveEvent() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (candidateRows.length === 0) {
        throw new Error("候補日を1件以上登録してください。");
      }

      if (
        (responseDeadlineDate && !responseDeadlineTime) ||
        (!responseDeadlineDate && responseDeadlineTime)
      ) {
        throw new Error("回答締切は日付と時間を両方入力してください。");
      }

      const candidateDates = candidateRows.map((row, index) => {
        if (!row.date || !row.time) {
          throw new Error("候補日は日付と時間を両方入力してください。");
        }

        return {
          id: row.id,
          candidateDate: toCandidateDateIsoFromParts(row.date, row.time),
          displayOrder: index,
        };
      });

      const responseDeadline =
        responseDeadlineDate && responseDeadlineTime
          ? toCandidateDateIsoFromParts(responseDeadlineDate, responseDeadlineTime)
          : null;

      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          language,
          responseDeadline,
          receptionStatus,
          shareEnabled,
          candidateDates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "保存に失敗しました。");
      }

      setMessage("イベント内容を保存しました。");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  async function saveResponse(responseId: string) {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const target = responses.find((response) => response.id === responseId);

      if (!target) {
        throw new Error("回答が見つかりません。");
      }

      const items = activeCandidateIds.map((eventDateId) => ({
        eventDateId,
        status: target.items[eventDateId] ?? "unavailable",
      }));

      const response = await fetch(
        `/api/admin/events/${event.id}/responses/${responseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: target.name,
            comment: target.comment,
            items,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "回答の保存に失敗しました。");
      }

      setMessage("回答内容を保存しました。");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "回答の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResponse(responseId: string) {
    if (!window.confirm("この回答者を削除しますか？")) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/responses/${responseId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "回答者の削除に失敗しました。");
      }

      setResponses((current) => current.filter((item) => item.id !== responseId));
      setMessage("回答者を削除しました。");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "回答者の削除に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent() {
    if (!window.confirm("イベントを削除しますか？この操作は元に戻せません。")) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "イベントの削除に失敗しました。");
      }

      router.push("/admin/events");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "イベントの削除に失敗しました。");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold">イベント編集</h2>
          <p className="text-sm text-foreground/60">
            候補日の追加・削除・並び替え、受付設定、回答の修正までこの画面で行えます。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>イベント名</Label>
            <Input value={title} onChange={(eventData) => setTitle(eventData.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>説明文</Label>
            <Textarea
              value={description}
              onChange={(eventData) => setDescription(eventData.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>表示言語</Label>
            <select
              className="h-12 w-full rounded-[22px] border bg-white px-4 text-sm"
              value={language}
              onChange={(eventData) =>
                setLanguage(eventData.target.value as EventDetail["language"])
              }
            >
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>受付状態</Label>
            <select
              className="h-12 w-full rounded-[22px] border bg-white px-4 text-sm"
              value={receptionStatus}
              onChange={(eventData) =>
                setReceptionStatus(
                  eventData.target.value as EventDetail["receptionStatus"],
                )
              }
            >
              <option value="open">受付中</option>
              <option value="paused">停止</option>
              <option value="closed">終了</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>回答締切日</Label>
            <Input
              type="date"
              value={responseDeadlineDate}
              onChange={(eventData) => setResponseDeadlineDate(eventData.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>回答締切時間</Label>
            <Input
              type="time"
              value={responseDeadlineTime}
              onChange={(eventData) => setResponseDeadlineTime(eventData.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 rounded-[22px] border bg-muted/40 px-4 py-3 text-sm font-semibold sm:col-span-2">
            <input
              type="checkbox"
              checked={shareEnabled}
              onChange={(eventData) => setShareEnabled(eventData.target.checked)}
            />
            共有URLを有効にする
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label>候補日と時間</Label>
            <Button type="button" variant="outline" onClick={addCandidate}>
              <Plus className="mr-2 size-4" />
              候補日を追加
            </Button>
          </div>

          {candidateRows.map((candidate, index) => (
            <div
              key={candidate.localId}
              className="rounded-[24px] border border-border bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground/60">
                  候補 {index + 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => moveCandidate(candidate.localId, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => moveCandidate(candidate.localId, 1)}
                    disabled={index === candidateRows.length - 1}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    onClick={() => removeCandidate(candidate.localId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>日付</Label>
                  <Input
                    type="date"
                    value={candidate.date}
                    onChange={(eventData) =>
                      updateCandidate(candidate.localId, { date: eventData.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>時間</Label>
                  <Input
                    type="time"
                    value={candidate.time}
                    onChange={(eventData) =>
                      updateCandidate(candidate.localId, { time: eventData.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {message ? (
          <p className="rounded-[18px] bg-[#ECFDF3] px-4 py-3 text-sm font-semibold text-primary">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-[18px] bg-[#fff5f4] px-4 py-3 text-sm font-semibold text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" size="lg" onClick={saveEvent} disabled={saving}>
            {saving ? "保存中..." : "保存する"}
          </Button>
          <Button type="button" size="lg" variant="danger" onClick={deleteEvent} disabled={saving}>
            イベントを削除
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold">回答者の編集</h2>
          <p className="mt-1 text-sm text-foreground/60">
            名前、コメント、各日程の回答をその場で修正できます。
          </p>
        </div>

        {responses.map((response) => (
          <Card key={response.id} className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <Label>回答者名</Label>
                  <Input
                    value={response.name}
                    onChange={(eventData) =>
                      setResponses((current) =>
                        current.map((item) =>
                          item.id === response.id
                            ? { ...item, name: eventData.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>コメント</Label>
                  <Textarea
                    value={response.comment}
                    onChange={(eventData) =>
                      setResponses((current) =>
                        current.map((item) =>
                          item.id === response.id
                            ? { ...item, comment: eventData.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => saveResponse(response.id)}
                  disabled={saving}
                >
                  保存
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => deleteResponse(response.id)}
                  disabled={saving}
                >
                  削除
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {candidateRows
                .filter((candidate) => candidate.id)
                .map((candidate, index) => {
                  const candidateId = candidate.id as string;

                  return (
                    <div
                      key={`${response.id}-${candidate.localId}`}
                      className="rounded-[20px] border border-border/80 p-3"
                    >
                      <div className="mb-3 text-sm font-semibold">
                        候補 {index + 1} : {candidate.date || "-"} {candidate.time || ""}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {statusOptions.map((status) => {
                          const active = response.items[candidateId] === status.value;

                          return (
                            <Button
                              key={status.value}
                              type="button"
                              variant={active ? "default" : "outline"}
                              onClick={() =>
                                setResponses((current) =>
                                  current.map((item) =>
                                    item.id === response.id
                                      ? {
                                          ...item,
                                          items: {
                                            ...item.items,
                                            [candidateId]: status.value,
                                          },
                                        }
                                      : item,
                                  ),
                                )
                              }
                            >
                              {status.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        ))}

        {responses.length === 0 ? (
          <Card className="p-5 text-sm text-foreground/60">
            まだ回答者はいません。
          </Card>
        ) : null}
      </div>
    </div>
  );
}
