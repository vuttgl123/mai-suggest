import type { Failure } from "@/core/application/result";

export type AdminFeedback = {
  tone: "error" | "success";
  message: string;
};

export function feedbackForFailure(result: Failure): AdminFeedback {
  const messages = {
    ACCESS_DENIED: "Tài khoản hiện tại không có quyền Owner.",
    NOT_FOUND: "Nội dung này không còn tồn tại. Hãy tải lại workspace.",
    UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.",
    UNEXPECTED_FAILURE: "Không thể lưu thay đổi lúc này. Hãy thử lại.",
    VALIDATION_FAILED:
      "Thông tin chưa hợp lệ. Kiểm tra slug, URL và mỗi lời nhắn trước khi lưu.",
  } as const;

  return { tone: "error", message: messages[result.error.code] };
}
