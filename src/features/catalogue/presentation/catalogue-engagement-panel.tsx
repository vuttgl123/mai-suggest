"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Check,
  Heart,
  MessageCircleHeart,
  Pencil,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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

  useEffect(() => {
    setScore(myRating?.score ?? 0);
    setNote(myRating?.note ?? "");
  }, [myRating?.id, myRating?.note, myRating?.score]);

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
    <div>
      <div className="max-w-2xl text-center">
        <span
          className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
          aria-hidden="true"
        >
          <Heart size={20} fill="currentColor" strokeWidth={1.35} />
        </span>
        <p className="diary-kicker mt-4">Một điều nhỏ để hiểu nhau hơn</p>
        <h2
          className="font-display mt-2 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-4xl"
          id="engagement-heading"
        >
          Góc nhìn của chúng mình
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
          Mỗi người giữ lại một cảm nhận riêng, để những điều nhỏ cũng có chỗ được lắng nghe.
        </p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(17rem,0.74fr)_minmax(0,1.26fr)] lg:gap-6">
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

      <section className="mt-8 border-t border-[var(--color-border)] pt-7" aria-labelledby="comments-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--color-brand-strong)]">
            <MessageCircleHeart className="text-[var(--color-accent)]" size={19} strokeWidth={1.45} aria-hidden="true" />
            <div>
              <p className="diary-kicker">Cùng giữ lại</p>
              <h3 className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em]" id="comments-heading">
                Lời bình của chúng mình
              </h3>
            </div>
          </div>
          <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
            {engagement.comments.length} lời bình
          </span>
        </div>

        <form
          className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            createComment();
          }}
        >
          <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
            Viết một điều mình muốn giữ lại
            <textarea
              className={inputClassName}
              disabled={isPending}
              maxLength={2000}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Một cảm xúc, một kỷ niệm, hoặc một lời nhắn nhỏ…"
              value={newComment}
            />
          </label>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[var(--color-muted)]">{newComment.length}/2000</span>
            <Button disabled={isPending} size="compact" type="submit">
              <Send size={15} aria-hidden="true" />
              {isPending ? "Đang lưu…" : "Lưu lời bình"}
            </Button>
          </div>
        </form>

        {feedback ? (
          <p aria-live="polite" className="mt-3 text-sm leading-6 text-[var(--color-brand)]">
            {feedback}
          </p>
        ) : null}

        {engagement.comments.length ? (
          <ol className="mt-5 space-y-3">
            {engagement.comments.map((comment) => {
              const isAuthor = comment.userId === actorId;
              const canDelete = isAuthor || canManage;
              const isEditing = editingCommentId === comment.id;

              return (
                <li
                  className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-4 sm:p-5"
                  key={comment.id}
                >
                  <div className="flex items-start gap-3">
                    <AuthorAvatar author={comment.author} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="text-sm font-bold text-[var(--color-brand-strong)]">
                          {comment.author.displayName}
                        </p>
                        <time className="text-xs text-[var(--color-muted)]" dateTime={comment.createdAt}>
                          {formatDate(comment.createdAt)}
                        </time>
                      </div>

                      {isEditing ? (
                        <form
                          className="mt-3"
                          onSubmit={(event) => {
                            event.preventDefault();
                            updateComment(comment.id);
                          }}
                        >
                          <textarea
                            className={inputClassName}
                            disabled={isPending}
                            maxLength={2000}
                            onChange={(event) => setEditingContent(event.target.value)}
                            value={editingContent}
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button disabled={isPending} size="compact" type="submit">
                              <Check size={15} aria-hidden="true" />
                              Lưu
                            </Button>
                            <Button
                              disabled={isPending}
                              onClick={() => setEditingCommentId(null)}
                              size="compact"
                              type="button"
                              variant="quiet"
                            >
                              <X size={15} aria-hidden="true" />
                              Hủy
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--color-ink)]">
                          {comment.content}
                        </p>
                      )}

                      {!isEditing && (isAuthor || canDelete) ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {isAuthor ? (
                            <Button
                              disabled={isPending}
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingContent(comment.content);
                              }}
                              size="compact"
                              type="button"
                              variant="quiet"
                            >
                              <Pencil size={14} aria-hidden="true" />
                              Sửa
                            </Button>
                          ) : null}
                          {canDelete ? (
                            <Button
                              disabled={isPending}
                              onClick={() => setConfirmingCommentId(comment.id)}
                              size="compact"
                              type="button"
                              variant="quiet"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                              {isAuthor ? "Xóa" : "Gỡ lời bình"}
                            </Button>
                          ) : null}
                        </div>
                      ) : null}

                      {confirmingCommentId === comment.id ? (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2.5">
                          <p className="text-xs leading-5 text-[var(--color-danger)]">
                            Bạn chắc chắn muốn xóa lời bình này?
                          </p>
                          <span className="flex gap-2">
                            <Button
                              disabled={isPending}
                              onClick={() => setConfirmingCommentId(null)}
                              size="compact"
                              type="button"
                              variant="quiet"
                            >
                              Hủy
                            </Button>
                            <Button
                              disabled={isPending}
                              onClick={() => deleteComment(comment.id)}
                              size="compact"
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
          <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
            Hãy là người đầu tiên để lại một điều thật riêng.
          </p>
        )}
      </section>
    </div>
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
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6"
      aria-labelledby="my-rating-heading"
    >
      <p className="diary-kicker">Cảm nhận của bạn</p>
      <h3 className="font-display mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]" id="my-rating-heading">
        Điều này làm bạn thích đến đâu?
      </h3>
      <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
        Không cần giống nhau — chỉ cần thật với cảm nhận của mình.
      </p>

      <form
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Mức độ yêu thích">
          {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => {
            const isSelected = score >= value;

            return (
              <button
                aria-label={`Chấm ${value} sao`}
                aria-pressed={score === value}
                className={`grid h-11 w-11 place-items-center rounded-full transition duration-[var(--duration-fast)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] ${
                  isSelected
                    ? "bg-[var(--color-brand)] text-white shadow-[var(--theme-button-shadow)]"
                    : "bg-[var(--color-paper)] text-[var(--color-accent)] hover:bg-[var(--color-brand-soft)]"
                }`}
                disabled={isPending}
                key={value}
                onClick={() => onScoreChange(value)}
                type="button"
              >
                <Star fill="currentColor" size={18} strokeWidth={1.55} aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--color-brand)]" aria-live="polite">
          {score ? `${score} trên 5 sao` : "Chưa chọn số sao"}
        </p>
        <label className="mt-4 block text-sm font-semibold text-[var(--color-brand-strong)]">
          Một lời nhắn nhỏ (không bắt buộc)
          <textarea
            className={inputClassName}
            disabled={isPending}
            maxLength={1000}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Điều làm mình muốn lưu lại là…"
            value={note}
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[var(--color-muted)]">{note.length}/1000</span>
          <div className="flex flex-wrap gap-2">
            {onDelete ? (
              <Button disabled={isPending} onClick={onDelete} size="compact" type="button" variant="quiet">
                <Trash2 size={14} aria-hidden="true" />
                Xóa đánh giá
              </Button>
            ) : null}
            <Button disabled={isPending || !score} size="compact" type="submit">
              <Check size={15} aria-hidden="true" />
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
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-soft)] sm:p-6"
      aria-labelledby="ratings-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="diary-kicker">Những cảm nhận đã lưu</p>
          <h3 className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]" id="ratings-heading">
            Mỗi người một góc nhìn
          </h3>
        </div>
        <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
          {ratings.length} cảm nhận
        </span>
      </div>

      {ratings.length ? (
        <ol className="mt-5 space-y-3">
          {ratings.map((rating) => (
            <li className="rounded-[1.15rem] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-4" key={rating.id}>
              <div className="flex items-start gap-3">
                <AuthorAvatar author={rating.author} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-sm font-bold text-[var(--color-brand-strong)]">{rating.author.displayName}</p>
                    <time className="text-xs text-[var(--color-muted)]" dateTime={rating.updatedAt}>
                      {formatDate(rating.updatedAt)}
                    </time>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)]">
                    <Star fill="currentColor" size={15} strokeWidth={1.55} aria-hidden="true" />
                    {rating.score} trên 5 sao
                  </p>
                  {rating.note ? (
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--color-ink)]">
                      {rating.note}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
          Chưa có cảm nhận nào. Một ngôi sao đầu tiên cũng là một lời nhắn dịu dàng.
        </p>
      )}
    </section>
  );
}

function AuthorAvatar({ author }: { author: EngagementAuthor }) {
  if (author.avatarUrl) {
    return (
      <img
        alt=""
        className="h-10 w-10 shrink-0 rounded-full border border-[var(--color-border)] object-cover"
        height={40}
        src={author.avatarUrl}
        width={40}
      />
    );
  }

  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] text-sm font-bold text-[var(--color-brand)]"
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
  "mt-2 min-h-28 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-3 text-sm leading-7 text-[var(--color-ink)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/25";
