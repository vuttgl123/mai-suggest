import {
  Clipboard,
  Download,
  Mail,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button, buttonClassName } from "@/components/ui/button";

interface SelectionSummaryActionsProps {
  hasContent: boolean;
  emailUrl: string;
  onShare(): void;
  onCopy(): void;
  onDownload(): void;
  onContinue(): void;
  onRequestReset(): void;
}

export function SelectionSummaryActions({
  hasContent,
  emailUrl,
  onShare,
  onCopy,
  onDownload,
  onContinue,
  onRequestReset,
}: SelectionSummaryActionsProps) {
  return (
    <footer className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-paper)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
      <div className="mx-auto flex max-w-3xl items-stretch gap-2">
        <Button
          onClick={onShare}
          disabled={!hasContent}
          className="min-h-12 flex-1 text-xs"
        >
          <Share2 size={16} aria-hidden="true" />
          Chia sẻ
        </Button>
        <Button
          variant="secondary"
          onClick={onContinue}
          className="min-h-12 px-3 text-xs sm:px-4"
        >
          <Pencil size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Tiếp tục chỉnh sửa</span>
          <span className="sm:hidden">Chỉnh sửa</span>
        </Button>
        <details className="group relative">
          <summary
            className={buttonClassName({
              variant: "secondary",
              size: "icon",
              className:
                "min-h-12 list-none [&::-webkit-details-marker]:hidden",
            })}
          >
            <MoreHorizontal size={18} aria-hidden="true" />
            <span className="sr-only">Cách khác</span>
          </summary>
          <div className="absolute bottom-full right-0 z-10 mb-2 grid w-64 gap-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-2 shadow-xl">
            <Button
              variant="quiet"
              onClick={onCopy}
              disabled={!hasContent}
              className="justify-start text-xs"
            >
              <Clipboard size={16} aria-hidden="true" />
              Sao chép kết quả
            </Button>
            <a
              href={hasContent ? emailUrl : undefined}
              aria-disabled={!hasContent}
              onClick={(event) => {
                if (!hasContent) event.preventDefault();
              }}
              className={buttonClassName({
                variant: "quiet",
                className: `justify-start text-xs ${
                  hasContent ? "" : "pointer-events-none opacity-45"
                }`,
              })}
            >
              <Mail size={16} aria-hidden="true" />
              Gửi qua email
            </a>
            <Button
              variant="quiet"
              onClick={onDownload}
              disabled={!hasContent}
              className="justify-start text-xs"
            >
              <Download size={16} aria-hidden="true" />
              Tải file văn bản
            </Button>
            <Button
              variant="quiet"
              onClick={onRequestReset}
              disabled={!hasContent}
              className="justify-start text-xs text-[var(--color-danger)]"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Làm lại từ đầu
            </Button>
          </div>
        </details>
      </div>
    </footer>
  );
}
