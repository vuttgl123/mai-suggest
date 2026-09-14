"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Check,
  MessageSquare,
  Pencil,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  createItemCommentAction,
  deleteItemCommentAction,
  deleteMyItemRatingAction,
  setMyItemRatingAction,
  updateMyItemCommentAction,
} from "@/modules/engagement/presentation/engagement-actions";
import type {
  EngagementAuthor,
  ItemEngagementView,
} from "@/modules/engagement/domain/item-engagement-view";

interface CatalogueEngagementPanelProps {
  itemId: string;
  engagement: ItemEngagementView;
  actorId: string;
  canManage: boolean;
}

export function CatalogueEngagementPanel({
  itemId,
  engagement,
  actorId,
  canManage,
}: CatalogueEngagementPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const myRating = engagement.ratings.find((rating) => rating.userId === actorId);
  const [score, setScore] = useState(myRating?.score ?? 0);
  const [note, setNote] = useState(myRating?.note ?? "");
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [confirmingCommentId, setConfirmingCommentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function runMutation(operation: () => Promise<void>) {
    startTransition(operation);
  }

  function saveRating() {
    if (!score) {
      setFeedback("Hãy chọn mức độ yêu thích trước khi lưu.");
      return;
    }

    runMutation(async () => {
      const result = await setMyItemRatingAction({
        itemId,
        score,
        note: note.trim() || null,
      });

      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setFeedback("Góc nhìn của bạn đã được lưu.");
      router.refresh();
    });
  }

  function deleteRating() {
    runMutation(async () => {
      const result = await deleteMyItemRatingAction(itemId);

      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setScore(0);
      setNote("");
      setFeedback("Đánh giá của bạn đã được xóa.");
      router.refresh();
    });
  }

  function createComment() {
    const content = newComment.trim();
    if (!content) {
      setFeedback("Hãy viết một điều bạn muốn giữ lại.");
      return;
    }

    runMutation(async () => {
      const result = await createItemCommentAction({ itemId, content });

      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setNewComment("");
      setFeedback("Lời bình đã được lưu.");
      router.refresh();
    });
  }

  function updateComment(commentId: string) {
    const content = editingContent.trim();
    if (!content) {
      setFeedback("Lời bình không thể để trống.");
      return;
    }

    runMutation(async () => {
      const result = await updateMyItemCommentAction({ commentId, content });

      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setEditingCommentId(null);
      setEditingContent("");
      setFeedback("Lời bình đã được cập nhật.");
      router.refresh();
    });
  }

  function deleteComment(commentId: string) {
    runMutation(async () => {
      const result = await deleteItemCommentAction(commentId);

      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }
      setConfirmingCommentId(null);
      setFeedback("Lời bình đã được gỡ.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(17rem,0.74fr)_minmax(0,1.26fr)] lg:gap-10">
        <RatingForm
          isPending={isPending}
          note={note}
          onDelete={myRating ? deleteRating : undefined}
          onNoteChange={setNote}
          onScoreChange={setScore}
          onSubmit={saveRating}
          score={score}
        />
        <RatingList ratings={engagement.ratings} />
      </div>

      <CommentList actorId={actorId} canManage={canManage} engagement={engagement} itemId={itemId} />
    </div>
  );
}

function CommentList({ actorId, canManage, engagement, itemId }: { actorId: string | null; canManage: boolean; engagement: ItemEngagementView; itemId: string; }) {
  const [confirmingCommentId, setConfirmingCommentId] = useState<
    string | null
  >(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState("");

  const createComment = () => {
    if (!newComment.trim()) return;

    startTransition(async () => {
      setFeedback(null);
      const result = await createItemCommentAction({ itemId: itemId, content: newComment });

      if (result.ok) {
        setNewComment("");
      } else {
        setFeedback(feedbackFor(result.error.code));
      }
    });
  };

  const updateComment = (commentId: string) => {
    if (!editingContent.trim()) return;

    startTransition(async () => {
      setFeedback(null);
      const result = await updateMyItemCommentAction({ commentId, content: editingContent });

      if (result.ok) {
        setEditingCommentId(null);
      } else {
        setFeedback(feedbackFor(result.error.code));
      }
    });
  };

  const deleteComment = (commentId: string) => {
    startTransition(async () => {
      setFeedback(null);
      const result = await deleteItemCommentAction(commentId);

      if (result.ok) {
        setConfirmingCommentId(null);
        if (editingCommentId === commentId) {
          setEditingCommentId(null);
        }
      } else {
        setFeedback(feedbackFor(result.error.code));
      }
    });
  };

  return (
    <section
      className="rounded-[2rem] border border-border/60 bg-[var(--color-surface)]/80 p-8 shadow-sm backdrop-blur-xl sm:p-10"
      aria-labelledby="comments-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-[var(--surface-elevated)] px-4 py-1.5 shadow-sm">
            <MessageSquare size={14} className="text-accent" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-accent">Lời bình</p>
          </div>
          <h3 className="font-display mt-6 text-3xl font-semibold tracking-tight text-brand-strong" id="comments-heading">
            Góc trò chuyện
          </h3>
        </div>
        <span className="inline-flex h-9 items-center justify-center rounded-full bg-brand-soft/50 px-4 text-[13px] font-semibold text-brand">
          {engagement.comments.length} lời bình
        </span>
      </div>

      <form
        className="mt-8 rounded-2xl border border-border/50 bg-[var(--surface-elevated)] p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          createComment();
        }}
      >
        <label className="block text-[15px] font-semibold text-brand-strong">
          Viết một điều mình muốn giữ lại
          <textarea
            className="mt-3 min-h-[120px] w-full resize-y rounded-2xl border border-border/50 bg-[var(--color-surface)] p-4 text-[15px] leading-relaxed text-ink shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-muted/70 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
            disabled={isPending}
            maxLength={2000}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Một cảm xúc, một kỷ niệm, hoặc một lời nhắn nhỏ…"
            value={newComment}
          />
        </label>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-[13px] font-medium text-muted/80">{newComment.length}/2000</span>
          <Button disabled={isPending || !newComment.trim()} className="h-11 rounded-full px-6 font-semibold shadow-sm" type="submit">
            <Send size={16} className="mr-2" aria-hidden="true" />
            {isPending ? "Đang lưu…" : "Lưu lời bình"}
          </Button>
        </div>
      </form>

      {feedback ? (
        <p aria-live="polite" className="mt-4 text-[14px] leading-relaxed text-brand">
          {feedback}
        </p>
      ) : null}

      {engagement.comments.length ? (
        <ol className="mt-8 space-y-4">
          {engagement.comments.map((comment) => {
            const isAuthor = comment.userId === actorId;
            const canDelete = isAuthor || canManage;
            const isEditing = editingCommentId === comment.id;

            return (
              <li
                className="rounded-3xl border border-border/50 bg-[var(--surface-elevated)] p-6 transition-all hover:shadow-sm sm:p-8"
                key={comment.id}
              >
                <div className="flex items-start gap-4">
                  <AuthorAvatar author={comment.author} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="text-[15px] font-semibold text-brand-strong">
                        {comment.author.displayName}
                      </p>
                      <time className="text-[13px] font-medium text-muted/80" dateTime={comment.createdAt}>
                        {formatDate(comment.createdAt)}
                      </time>
                    </div>

                    {isEditing ? (
                      <form
                        className="mt-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          updateComment(comment.id);
                        }}
                      >
                        <textarea
                          className="mt-2 min-h-[100px] w-full resize-y rounded-2xl border border-border/50 bg-[var(--color-surface)] p-4 text-[15px] leading-relaxed text-ink shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] outline-none transition-all focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
                          disabled={isPending}
                          maxLength={2000}
                          onChange={(event) => setEditingContent(event.target.value)}
                          value={editingContent}
                        />
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Button disabled={isPending || !editingContent.trim()} className="h-10 rounded-full px-5" type="submit">
                            <Check size={16} className="mr-2" aria-hidden="true" />
                            Lưu
                          </Button>
                          <Button
                            disabled={isPending}
                            onClick={() => setEditingCommentId(null)}
                            className="h-10 rounded-full px-5"
                            type="button"
                            variant="quiet"
                          >
                            <X size={16} className="mr-2" aria-hidden="true" />
                            Hủy
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                        {comment.content}
                      </p>
                    )}

                    {!isEditing && (isAuthor || canDelete) ? (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {isAuthor ? (
                          <Button
                            disabled={isPending}
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingContent(comment.content);
                            }}
                            className="h-9 rounded-full px-4 text-[13px]"
                            type="button"
                            variant="quiet"
                          >
                            <Pencil size={14} className="mr-1.5" aria-hidden="true" />
                            Sửa
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                            disabled={isPending}
                            onClick={() => setConfirmingCommentId(comment.id)}
                            className="h-9 rounded-full px-4 text-[13px] text-danger hover:bg-danger/5"
                            type="button"
                            variant="quiet"
                          >
                            <Trash2 size={14} className="mr-1.5" aria-hidden="true" />
                            {isAuthor ? "Xóa" : "Gỡ lời bình"}
                          </Button>
                        ) : null}
                      </div>
                    ) : null}

                    {confirmingCommentId === comment.id ? (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-danger/20 bg-danger/5 p-4 sm:p-5">
                        <p className="text-[14px] font-medium text-danger">
                          Bạn chắc chắn muốn xóa lời bình này?
                        </p>
                        <span className="flex gap-3">
                          <Button
                            disabled={isPending}
                            onClick={() => setConfirmingCommentId(null)}
                            className="h-9 rounded-full px-4 text-[13px]"
                            type="button"
                            variant="quiet"
                          >
                            Hủy
                          </Button>
                          <Button
                            disabled={isPending}
                            onClick={() => deleteComment(comment.id)}
                            className="h-9 rounded-full px-4 text-[13px] bg-danger text-white hover:bg-danger/90 border-transparent"
                            type="button"
                            variant="danger"
                          >
                            Xóa
                          </Button>
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border/60 bg-[var(--surface-elevated)]/50 p-8 text-center">
          <p className="text-[15px] leading-relaxed text-muted">
            Hãy là người đầu tiên để lại một điều thật riêng.
          </p>
        </div>
      )}
    </section>
  );
}

function RatingForm({
  isPending,
  note,
  onDelete,
  onNoteChange,
  onScoreChange,
  onSubmit,
  score,
}: {
  isPending: boolean;
  note: string;
  onDelete: (() => void) | undefined;
  onNoteChange: (value: string) => void;
  onScoreChange: (score: number) => void;
  onSubmit: () => void;
  score: number;
}) {
  return (
    <section
      className="rounded-[2rem] border border-border/60 bg-[var(--surface-elevated)] p-8 shadow-sm backdrop-blur-xl sm:p-10"
      aria-labelledby="my-rating-heading"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-[var(--color-surface)] px-4 py-1.5 shadow-sm">
        <Star size={14} className="text-accent" aria-hidden="true" />
        <p className="text-[13px] font-semibold text-accent">Cảm nhận của bạn</p>
      </div>
      <h3 className="font-display mt-6 text-3xl font-semibold tracking-tight text-brand-strong" id="my-rating-heading">
        Điều này làm bạn thích đến đâu?
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Không cần giống nhau, chỉ cần thật với cảm nhận của mình.
      </p>

      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Mức độ yêu thích">
          {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => {
            const isSelected = score >= value;

            return (
              <button
                aria-label={`Chấm ${value} sao`}
                aria-pressed={score === value}
                className={`grid h-12 w-12 place-items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                  isSelected
                    ? "bg-brand-strong text-white shadow-md scale-105"
                    : "bg-black/5 text-muted hover:bg-brand-soft/50 hover:text-brand"
                }`}
                disabled={isPending}
                key={value}
                onClick={() => onScoreChange(value)}
                type="button"
              >
                <Star fill="currentColor" size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[14px] font-semibold text-brand" aria-live="polite">
          {score ? `${score} trên 5 sao` : "Chưa chọn số sao"}
        </p>
        
        <label className="mt-8 block text-[15px] font-semibold text-brand-strong">
          Một lời nhắn nhỏ (không bắt buộc)
          <textarea
            className="mt-3 min-h-[120px] w-full resize-y rounded-2xl border border-border/50 bg-[var(--color-surface)] p-4 text-[15px] leading-relaxed text-ink shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-muted/70 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
            disabled={isPending}
            maxLength={1000}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Điều làm mình muốn lưu lại là…"
            value={note}
          />
        </label>
        
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span className="text-[13px] font-medium text-muted/80">{note.length}/1000 ký tự</span>
          <div className="flex flex-wrap items-center gap-3">
            {onDelete ? (
              <Button disabled={isPending} onClick={onDelete} type="button" variant="quiet">
                <Trash2 size={16} className="mr-2" aria-hidden="true" />
                Xóa đánh giá
              </Button>
            ) : null}
            <Button disabled={isPending || !score} type="submit" className="h-11 rounded-full px-6 font-semibold shadow-sm">
              <Check size={16} className="mr-2" aria-hidden="true" />
              {isPending ? "Đang lưu…" : "Lưu cảm nhận"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

function RatingList({ ratings }: { ratings: ItemEngagementView["ratings"] }) {
  return (
    <section
      className="rounded-[2rem] border border-border/60 bg-[var(--color-surface)]/80 p-8 shadow-sm backdrop-blur-xl sm:p-10"
      aria-labelledby="ratings-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-[var(--surface-elevated)] px-4 py-1.5 shadow-sm">
            <Star size={14} className="text-accent" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-accent">Cộng đồng</p>
          </div>
          <h3 className="font-display mt-6 text-3xl font-semibold tracking-tight text-brand-strong" id="ratings-heading">
            Mỗi người một góc nhìn
          </h3>
        </div>
        <span className="inline-flex h-9 items-center justify-center rounded-full bg-brand-soft/50 px-4 text-[13px] font-semibold text-brand">
          {ratings.length} cảm nhận
        </span>
      </div>

      {ratings.length ? (
        <ol className="mt-8 space-y-4">
          {ratings.map((rating) => (
            <li className="rounded-3xl border border-border/50 bg-[var(--surface-elevated)] p-6 transition-all hover:shadow-sm" key={rating.id}>
              <div className="flex items-start gap-4">
                <AuthorAvatar author={rating.author} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-[15px] font-semibold text-brand-strong">{rating.author.displayName}</p>
                    <time className="text-[13px] font-medium text-muted/80" dateTime={rating.updatedAt}>
                      {formatDate(rating.updatedAt)}
                    </time>
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-soft/30 px-2.5 py-1">
                    <Star fill="currentColor" size={13} className="text-brand" aria-hidden="true" />
                    <span className="text-[12px] font-semibold text-brand">{rating.score}/5</span>
                  </div>
                  {rating.note ? (
                    <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                      {rating.note}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border/60 bg-[var(--surface-elevated)]/50 p-8 text-center">
          <p className="text-[15px] leading-relaxed text-muted">
            Chưa có cảm nhận nào. Một ngôi sao đầu tiên cũng là một lời nhắn dịu dàng.
          </p>
        </div>
      )}
    </section>
  );
}

function AuthorAvatar({ author }: { author: EngagementAuthor }) {
  if (author.avatarUrl) {
    return (
      <img
        alt=""
        className="h-12 w-12 shrink-0 rounded-full border border-border/50 object-cover shadow-sm"
        height={48}
        src={author.avatarUrl}
        width={48}
      />
    );
  }

  return (
    <span
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-strong text-[15px] font-bold text-white shadow-sm"
      aria-hidden="true"
    >
      {author.displayName.trim().slice(0, 1).toLocaleUpperCase("vi-VN") || "T"}
    </span>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function feedbackFor(code: string): string {
  if (code === "ACCESS_DENIED") return "Bạn không có quyền thực hiện thao tác này.";
  if (code === "NOT_FOUND") return "Nội dung này không còn tồn tại hoặc đã được ẩn.";
  if (code === "VALIDATION_FAILED") return "Hãy kiểm tra lại số sao và độ dài nội dung.";
  return "Không thể lưu thay đổi lúc này. Hãy thử lại sau.";
}

const inputClassName =
  "mt-2 min-h-28 w-full rounded-xl border border-border bg-paper px-3 py-3 text-sm leading-7 text-ink shadow-sm outline-none placeholder:text-muted focus:border-focus focus-visible:ring-2 focus-visible:ring-focus/25";
