"use client";

/* Avatar URLs are supplied by Supabase and are intentionally rendered through
 * a native image boundary instead of a fixed Next Image allow-list. */
/* eslint-disable @next/next/no-img-element */

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  createTimelineResponseAction,
  deleteTimelineResponseAction,
  updateTimelineResponseAction,
} from "@/modules/timeline/presentation/timeline-actions";
import type { TimelineResponse } from "@/modules/timeline/domain/timeline-models";

interface TimelineResponsePanelProps {
  entryId: string;
  responses: TimelineResponse[];
  actorId: string;
  canManage: boolean;
}

export function TimelineResponsePanel({
  entryId,
  responses,
  actorId,
  canManage,
}: TimelineResponsePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newContent, setNewContent] = useState("");
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [confirmingResponseId, setConfirmingResponseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function runMutation(operation: () => Promise<void>) {
    startTransition(operation);
  }

  function createResponse() {
    const content = newContent.trim();
    if (!content) {
      setFeedback("Hãy viết vài chữ trước khi gửi.");
      return;
    }

    runMutation(async () => {
      const result = await createTimelineResponseAction({ entryId, content });
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setNewContent("");
      setFeedback("Đã gửi hồi đáp.");
      router.refresh();
    });
  }

  function updateResponse(responseId: string) {
    const content = editingContent.trim();
    if (!content) {
      setFeedback("Lời hồi đáp không thể để trống.");
      return;
    }

    runMutation(async () => {
      const result = await updateTimelineResponseAction(responseId, { content });
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setEditingResponseId(null);
      setEditingContent("");
      setFeedback("Đã cập nhật lời hồi đáp.");
      router.refresh();
    });
  }

  function deleteResponse(responseId: string) {
    runMutation(async () => {
      const result = await deleteTimelineResponseAction(responseId);
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setConfirmingResponseId(null);
      setFeedback("Đã xóa lời hồi đáp.");
      router.refresh();
    });
  }

  return (
    <section className="mt-16 border-t border-border pt-8" aria-labelledby={`responses-${entryId}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 id={`responses-${entryId}`} className="font-display text-xl font-medium text-brand-strong">
          Hồi đáp
        </h3>
        <span className="tabular text-sm text-muted">{responses.length} lời</span>
      </div>

      {responses.length ? (
        <ol className="mt-6 grid gap-6">
          {responses.map((response) => {
            const isAuthor = response.userId === actorId;
            const canDelete = isAuthor || canManage;
            const isEditing = editingResponseId === response.id;

            return (
              <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3" key={response.id}>
                <Avatar displayName={response.author.displayName} imageUrl={response.author.avatarUrl} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="max-w-full truncate font-semibold text-ink" title={response.author.displayName}>
                      {response.author.displayName}
                    </span>
                    <time className="text-muted" dateTime={response.createdAt}>{formatResponseDate(response.createdAt)}</time>
                  </p>
                  {isEditing ? (
                    <form
                      className="mt-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        updateResponse(response.id);
                      }}
                    >
                      <label className="sr-only" htmlFor={`edit-response-${response.id}`}>
                        Sửa lời hồi đáp
                      </label>
                      <textarea id={`edit-response-${response.id}`} className={inputClassName} disabled={isPending} maxLength={2000} onChange={(event) => setEditingContent(event.target.value)} value={editingContent} />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button disabled={isPending} size="compact" type="submit"><Check size={15} aria-hidden="true" />Lưu</Button>
                        <Button disabled={isPending} onClick={() => setEditingResponseId(null)} size="compact" type="button" variant="quiet"><X size={15} aria-hidden="true" />Hủy</Button>
                      </div>
                    </form>
                  ) : (
                    <p className="font-prose mt-1 whitespace-pre-line text-base leading-[1.7] text-ink">{response.content}</p>
                  )}
                  {!isEditing && canDelete ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {isAuthor ? <Button disabled={isPending} onClick={() => { setEditingResponseId(response.id); setEditingContent(response.content); }} size="compact" type="button" variant="quiet"><Pencil size={14} aria-hidden="true" />Sửa</Button> : null}
                      <Button disabled={isPending} onClick={() => setConfirmingResponseId(response.id)} size="compact" type="button" variant="quiet"><Trash2 size={14} aria-hidden="true" />{isAuthor ? "Xóa" : "Gỡ"}</Button>
                    </div>
                  ) : null}
                  {confirmingResponseId === response.id ? (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-danger/40 px-3 py-2">
                      <p className="text-sm text-danger">Xóa lời hồi đáp này? Thao tác không thể hoàn tác.</p>
                      <span className="flex gap-2"><Button disabled={isPending} onClick={() => setConfirmingResponseId(null)} size="compact" type="button" variant="quiet">Giữ lại</Button><Button disabled={isPending} onClick={() => deleteResponse(response.id)} size="compact" type="button" variant="danger"><Trash2 size={14} aria-hidden="true" />Xóa</Button></span>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 text-muted">Chưa có hồi đáp nào cho chương này.</p>
      )}

      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          createResponse();
        }}
      >
        <label className="block text-sm font-medium text-ink" htmlFor={`new-response-${entryId}`}>
          Viết hồi đáp
        </label>
        <textarea
          className={inputClassName}
          disabled={isPending}
          id={`new-response-${entryId}`}
          maxLength={2000}
          onChange={(event) => setNewContent(event.target.value)}
          placeholder="Một điều bạn còn nhớ về hôm ấy"
          value={newContent}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="tabular text-sm text-muted">{newContent.length}/2000</span>
          <Button disabled={isPending} type="submit">
            {isPending ? "Đang gửi…" : "Gửi hồi đáp"}
          </Button>
        </div>
        {feedback ? <p aria-live="polite" className="mt-3 text-sm text-brand">{feedback}</p> : null}
      </form>
    </section>
  );
}

function Avatar({ displayName, imageUrl }: { displayName: string; imageUrl: string | null }) {
  if (imageUrl) {
    return <img alt="" className="h-8 w-8 shrink-0 rounded-full border border-border object-cover" height={32} src={imageUrl} width={32} />;
  }

  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-paper-deep font-display text-[0.8125rem] font-medium text-brand-strong" aria-hidden="true">{displayName.trim().slice(0, 1).toLocaleUpperCase("vi-VN") || "T"}</span>;
}

function formatResponseDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function feedbackFor(code: string): string {
  if (code === "ACCESS_DENIED") return "Bạn không có quyền thực hiện thao tác này.";
  if (code === "NOT_FOUND") return "Hồi đáp này không còn tồn tại hoặc mốc đã được ẩn.";
  if (code === "VALIDATION_FAILED") return "Nội dung cần có từ 1 đến 2.000 ký tự.";
  return "Không thể lưu thay đổi lúc này. Hãy thử lại sau.";
}

const inputClassName = "font-prose mt-2 min-h-28 w-full rounded-[var(--radius-card)] border border-border-input bg-paper px-3.5 py-3 text-base leading-[1.7] text-ink outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
