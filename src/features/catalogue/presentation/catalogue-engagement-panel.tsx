"use client";

/* Avatar URLs come from synced Google profiles. */
/* eslint-disable @next/next/no-img-element */

import { Check, Pencil, Star, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { MyItemStatePanel } from "@/features/catalogue/presentation/my-item-state-panel";
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

/* Everything here is attributed to a member: my state, each person's rating,
 * each comment. Nothing is merged into one shared score. */
export function CatalogueEngagementPanel({
  itemId,
  engagement,
  actorId,
  canManage,
}: CatalogueEngagementPanelProps) {
  const myRating = engagement.ratings.find((rating) => rating.userId === actorId) ?? null;

  return (
    <div className="grid gap-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-6">
        <div className="grid content-start gap-12 lg:col-span-6">
          <MyItemStatePanel itemId={itemId} state={engagement.state} />
          <RatingForm itemId={itemId} myRating={myRating} />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <RatingList ratings={engagement.ratings} />
        </div>
      </div>
      <CommentList actorId={actorId} canManage={canManage} engagement={engagement} itemId={itemId} />
    </div>
  );
}

function RatingForm({
  itemId,
  myRating,
}: {
  itemId: string;
  myRating: ItemEngagementView["ratings"][number] | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState(myRating?.score ?? 0);
  const [note, setNote] = useState(myRating?.note ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);

  function saveRating() {
    if (!score) {
      setFeedback("Hãy chọn số sao trước khi lưu.");
      return;
    }

    startTransition(async () => {
      const result = await setMyItemRatingAction({ itemId, score, note: note.trim() || null });
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }
      setFeedback("Đã lưu cảm nhận của bạn.");
      router.refresh();
    });
  }

  function deleteRating() {
    startTransition(async () => {
      const result = await deleteMyItemRatingAction(itemId);
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }
      setScore(0);
      setNote("");
      setFeedback("Đã xóa cảm nhận của bạn.");
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="my-rating-heading">
      <h3 className="font-display text-xl font-medium text-brand-strong" id="my-rating-heading">
        Cảm nhận của bạn
      </h3>
      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          saveRating();
        }}
      >
        <fieldset disabled={isPending}>
          <legend className="text-sm text-muted">Bạn thích điều này đến đâu?</legend>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => {
              const isFilled = score >= value;
              return (
                <button
                  aria-label={`${value} trên 5 sao`}
                  aria-pressed={score === value}
                  className={`grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-brand-soft ${isFilled ? "text-brand" : "text-muted"}`}
                  key={value}
                  onClick={() => setScore(value)}
                  type="button"
                >
                  <Star aria-hidden="true" fill={isFilled ? "currentColor" : "none"} size={22} strokeWidth={1.5} />
                </button>
              );
            })}
            <span aria-live="polite" className="tabular ml-2 text-sm font-semibold text-ink">
              {score ? `${score} trên 5` : "Chưa chọn"}
            </span>
          </div>
        </fieldset>

        <label className="mt-5 block text-sm font-medium text-ink" htmlFor={`rating-note-${itemId}`}>
          Lời nhắn đi kèm <span className="font-normal text-muted">(không bắt buộc)</span>
        </label>
        <textarea
          className={inputClassName}
          disabled={isPending}
          id={`rating-note-${itemId}`}
          maxLength={1000}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Điều làm mình muốn giữ lại là…"
          value={note}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="tabular text-sm text-muted">{note.length}/1000</span>
          <div className="flex flex-wrap gap-2">
            {myRating ? (
              <Button disabled={isPending} onClick={deleteRating} type="button" variant="quiet">
                <Trash2 aria-hidden="true" size={15} />
                Xóa cảm nhận
              </Button>
            ) : null}
            <Button disabled={isPending || !score} type="submit">
              {isPending ? "Đang lưu…" : "Lưu cảm nhận"}
            </Button>
          </div>
        </div>
        {feedback ? <p aria-live="polite" className="mt-2 text-sm text-brand">{feedback}</p> : null}
      </form>
    </section>
  );
}

function RatingList({ ratings }: { ratings: ItemEngagementView["ratings"] }) {
  return (
    <section aria-labelledby="ratings-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-medium text-brand-strong" id="ratings-heading">
          Cảm nhận của mọi người
        </h3>
        <span className="tabular text-sm text-muted">{ratings.length} cảm nhận</span>
      </div>
      {ratings.length ? (
        <ol className="mt-5 grid gap-6 border-t border-border pt-5">
          {ratings.map((rating) => (
            <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3" key={rating.id}>
              <AuthorAvatar author={rating.author} />
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="max-w-full truncate font-semibold text-ink" title={rating.author.displayName}>
                    {rating.author.displayName}
                  </span>
                  <time className="text-muted" dateTime={rating.updatedAt}>{formatDate(rating.updatedAt)}</time>
                </p>
                <p className="tabular mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  <Star aria-hidden="true" fill="currentColor" size={14} strokeWidth={1.5} />
                  {rating.score} trên 5
                </p>
                {rating.note ? (
                  <p className="font-prose mt-1 whitespace-pre-line text-base leading-[1.7] text-ink">{rating.note}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 border-t border-border pt-5 text-muted">Chưa có ai để lại cảm nhận.</p>
      )}
    </section>
  );
}

function CommentList({
  actorId,
  canManage,
  engagement,
  itemId,
}: {
  actorId: string;
  canManage: boolean;
  engagement: ItemEngagementView;
  itemId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [confirmingCommentId, setConfirmingCommentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function createComment() {
    const content = newComment.trim();
    if (!content) return;

    startTransition(async () => {
      const result = await createItemCommentAction({ itemId, content });
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }
      setNewComment("");
      setFeedback("Đã gửi bình luận.");
      router.refresh();
    });
  }

  function updateComment(commentId: string) {
    const content = editingContent.trim();
    if (!content) return;

    startTransition(async () => {
      const result = await updateMyItemCommentAction({ commentId, content });
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }
      setEditingCommentId(null);
      setFeedback("Đã cập nhật bình luận.");
      router.refresh();
    });
  }

  function deleteComment(commentId: string) {
    startTransition(async () => {
      const result = await deleteItemCommentAction(commentId);
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }
      setConfirmingCommentId(null);
      setFeedback("Đã xóa bình luận.");
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="comments-heading" className="border-t border-border pt-10 lg:max-w-[46rem]">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-medium text-brand-strong" id="comments-heading">
          Bình luận
        </h3>
        <span className="tabular text-sm text-muted">{engagement.comments.length} lời</span>
      </div>

      {engagement.comments.length ? (
        <ol className="mt-6 grid gap-6">
          {engagement.comments.map((comment) => {
            const isAuthor = comment.userId === actorId;
            const canDelete = isAuthor || canManage;
            const isEditing = editingCommentId === comment.id;

            return (
              <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3" key={comment.id}>
                <AuthorAvatar author={comment.author} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="max-w-full truncate font-semibold text-ink" title={comment.author.displayName}>
                      {comment.author.displayName}
                    </span>
                    <time className="text-muted" dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                  </p>
                  {isEditing ? (
                    <form
                      className="mt-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        updateComment(comment.id);
                      }}
                    >
                      <label className="sr-only" htmlFor={`edit-comment-${comment.id}`}>
                        Sửa bình luận
                      </label>
                      <textarea
                        className={inputClassName}
                        disabled={isPending}
                        id={`edit-comment-${comment.id}`}
                        maxLength={2000}
                        onChange={(event) => setEditingContent(event.target.value)}
                        value={editingContent}
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button disabled={isPending || !editingContent.trim()} size="compact" type="submit">
                          <Check aria-hidden="true" size={15} />
                          Lưu
                        </Button>
                        <Button disabled={isPending} onClick={() => setEditingCommentId(null)} size="compact" type="button" variant="quiet">
                          <X aria-hidden="true" size={15} />
                          Hủy
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="font-prose mt-1 whitespace-pre-line text-base leading-[1.7] text-ink">{comment.content}</p>
                  )}
                  {!isEditing && canDelete ? (
                    <div className="mt-1 flex flex-wrap gap-1">
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
                          <Pencil aria-hidden="true" size={14} />
                          Sửa
                        </Button>
                      ) : null}
                      <Button disabled={isPending} onClick={() => setConfirmingCommentId(comment.id)} size="compact" type="button" variant="quiet">
                        <Trash2 aria-hidden="true" size={14} />
                        {isAuthor ? "Xóa" : "Gỡ"}
                      </Button>
                    </div>
                  ) : null}
                  {confirmingCommentId === comment.id ? (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-danger/40 px-3 py-2">
                      <p className="text-sm text-danger">Xóa bình luận này? Thao tác không thể hoàn tác.</p>
                      <span className="flex gap-2">
                        <Button disabled={isPending} onClick={() => setConfirmingCommentId(null)} size="compact" type="button" variant="quiet">
                          Giữ lại
                        </Button>
                        <Button disabled={isPending} onClick={() => deleteComment(comment.id)} size="compact" type="button" variant="danger">
                          <Trash2 aria-hidden="true" size={14} />
                          Xóa
                        </Button>
                      </span>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 text-muted">Chưa có bình luận nào.</p>
      )}

      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          createComment();
        }}
      >
        <label className="block text-sm font-medium text-ink" htmlFor={`new-comment-${itemId}`}>
          Viết bình luận
        </label>
        <textarea
          className={inputClassName}
          disabled={isPending}
          id={`new-comment-${itemId}`}
          maxLength={2000}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Một hôm nào đó, mình cùng đi nhé…"
          value={newComment}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="tabular text-sm text-muted">{newComment.length}/2000</span>
          <Button disabled={isPending || !newComment.trim()} type="submit">
            {isPending ? "Đang gửi…" : "Gửi bình luận"}
          </Button>
        </div>
        {feedback ? <p aria-live="polite" className="mt-2 text-sm text-brand">{feedback}</p> : null}
      </form>
    </section>
  );
}

function AuthorAvatar({ author }: { author: EngagementAuthor }) {
  if (author.avatarUrl) {
    return <img alt="" className="h-8 w-8 shrink-0 rounded-full border border-border object-cover" height={32} src={author.avatarUrl} width={32} />;
  }

  return (
    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-paper-deep font-display text-[0.8125rem] font-medium text-brand-strong">
      {author.displayName.trim().charAt(0).toLocaleUpperCase("vi") || "T"}
    </span>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function feedbackFor(code: string): string {
  if (code === "ACCESS_DENIED") return "Bạn không có quyền thực hiện thao tác này.";
  if (code === "NOT_FOUND") return "Nội dung này không còn tồn tại hoặc đã được ẩn.";
  if (code === "VALIDATION_FAILED") return "Hãy kiểm tra lại số sao và độ dài nội dung.";
  return "Chưa lưu được thay đổi. Hãy thử lại sau.";
}

const inputClassName =
  "font-prose mt-2 min-h-28 w-full rounded-[var(--radius-card)] border border-border-input bg-paper px-3.5 py-3 text-base leading-[1.7] text-ink outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60";
