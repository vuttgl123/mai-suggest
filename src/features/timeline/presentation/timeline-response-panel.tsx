"use client";

import { Check, MessageCircleHeart, Pencil, Send, Trash2, X } from "lucide-react";
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
      setFeedback("Hãy viết một điều bạn muốn giữ lại.");
      return;
    }

    runMutation(async () => {
      const result = await createTimelineResponseAction({ entryId, content });
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setNewContent("");
      setFeedback("Lời hồi đáp đã được lưu.");
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
    <section className="mt-7 border-t border-[var(--color-border)] pt-5" aria-labelledby={`responses-${entryId}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[var(--color-brand-strong)]">
          <MessageCircleHeart className="text-[var(--color-accent)]" size={18} strokeWidth={1.45} aria-hidden="true" />
          <h4 id={`responses-${entryId}`} className="font-display text-xl font-semibold tracking-[-0.035em]">
            Những lời giữ lại
          </h4>
        </div>
        <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
          {responses.length} hồi đáp
        </span>
      </div>

      <form
        className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_249_243_/_70%)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          createResponse();
        }}
      >
        <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
          Viết một điều mình muốn giữ lại
          <textarea
            className={inputClassName}
            disabled={isPending}
            maxLength={2000}
            onChange={(event) => setNewContent(event.target.value)}
            placeholder="Một cảm xúc, một kỷ niệm, hoặc một lời nhắn nhỏ…"
            value={newContent}
          />
        </label>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--color-muted)]">{newContent.length}/2000</span>
          <Button disabled={isPending} size="compact" type="submit">
            <Send size={15} aria-hidden="true" />
            {isPending ? "Đang lưu…" : "Lưu hồi đáp"}
          </Button>
        </div>
      </form>

      {feedback ? <p aria-live="polite" className="mt-3 text-sm leading-6 text-[var(--color-brand)]">{feedback}</p> : null}

      {responses.length ? (
        <ol className="mt-5 space-y-3">
          {responses.map((response) => {
            const isAuthor = response.userId === actorId;
            const canDelete = isAuthor || canManage;
            const isEditing = editingResponseId === response.id;

            return (
              <li className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-4" key={response.id}>
                <div className="flex items-start gap-3">
                  <Avatar displayName={response.author.displayName} imageUrl={response.author.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="text-sm font-bold text-[var(--color-brand-strong)]">{response.author.displayName}</p>
                      <time className="text-xs text-[var(--color-muted)]" dateTime={response.createdAt}>{formatResponseDate(response.createdAt)}</time>
                    </div>
                    {isEditing ? (
                      <form
                        className="mt-3"
                        onSubmit={(event) => {
                          event.preventDefault();
                          updateResponse(response.id);
                        }}
                      >
                        <textarea className={inputClassName} disabled={isPending} maxLength={2000} onChange={(event) => setEditingContent(event.target.value)} value={editingContent} />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button disabled={isPending} size="compact" type="submit"><Check size={15} aria-hidden="true" />Lưu</Button>
                          <Button disabled={isPending} onClick={() => setEditingResponseId(null)} size="compact" type="button" variant="quiet"><X size={15} aria-hidden="true" />Hủy</Button>
                        </div>
                      </form>
                    ) : (
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--color-ink)]">{response.content}</p>
                    )}
                    {!isEditing && (isAuthor || canDelete) ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {isAuthor ? <Button disabled={isPending} onClick={() => { setEditingResponseId(response.id); setEditingContent(response.content); }} size="compact" type="button" variant="quiet"><Pencil size={14} aria-hidden="true" />Sửa</Button> : null}
                        {canDelete ? <Button disabled={isPending} onClick={() => setConfirmingResponseId(response.id)} size="compact" type="button" variant="quiet"><Trash2 size={14} aria-hidden="true" />{isAuthor ? "Xóa" : "Gỡ hồi đáp"}</Button> : null}
                      </div>
                    ) : null}
                    {confirmingResponseId === response.id ? (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2.5">
                        <p className="text-xs leading-5 text-[var(--color-danger)]">Bạn chắc chắn muốn xóa hồi đáp này?</p>
                        <span className="flex gap-2"><Button disabled={isPending} onClick={() => setConfirmingResponseId(null)} size="compact" type="button" variant="quiet">Hủy</Button><Button disabled={isPending} onClick={() => deleteResponse(response.id)} size="compact" type="button" variant="danger">Xóa</Button></span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">Hãy là người đầu tiên để lại một điều thật riêng.</p>}
    </section>
  );
}

function Avatar({ displayName, imageUrl }: { displayName: string; imageUrl: string | null }) {
  if (imageUrl) {
    return <img alt="" className="h-10 w-10 shrink-0 rounded-full border border-[var(--color-border)] object-cover" height={40} src={imageUrl} width={40} />;
  }

  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] text-sm font-bold text-[var(--color-brand)]" aria-hidden="true">{displayName.trim().slice(0, 1).toLocaleUpperCase("vi-VN") || "T"}</span>;
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

const inputClassName = "mt-2 min-h-28 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-3 text-sm leading-7 text-[var(--color-ink)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)]";
