import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "public", "data");
const categoryDir = path.join(dataDir, "categories");

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const definitions = [
  {
    id: "gift-ideas",
    occasions: ["ngay-thuong", "sinh-nhat", "ky-niem", "valentine", "cam-on"],
    styles: ["lang-man", "ca-nhan-hoa", "am-ap"],
    budgetTier: "linh-hoat",
    giftType: "ca-nhan-hoa",
    items: [],
  },
  {
    id: "dresses",
    occasions: ["sinh-nhat", "ky-niem", "quoc-te-phu-nu", "phu-nu-viet-nam"],
    styles: ["nu-tinh", "thanh-lich", "sang-trong"],
    budgetTier: "3m-10m",
    giftType: "vat-pham",
    items: [],
  },
  {
    id: "bags",
    occasions: ["sinh-nhat", "ky-niem", "quoc-te-phu-nu", "phu-nu-viet-nam"],
    styles: ["thanh-lich", "thiet-thuc", "sang-trong"],
    budgetTier: "3m-10m",
    giftType: "vat-pham",
    items: [],
  },
  {
    id: "shoes",
    occasions: ["sinh-nhat", "ky-niem", "phu-nu-viet-nam"],
    styles: ["nu-tinh", "co-dien", "thanh-lich"],
    budgetTier: "3m-10m",
    giftType: "vat-pham",
    items: [],
  },
  {
    id: "jewelry",
    occasions: ["sinh-nhat", "ky-niem", "valentine", "cau-hon-cam-ket"],
    styles: ["co-dien", "lang-man", "sang-trong"],
    budgetTier: "tren-10m",
    giftType: "vat-pham",
    items: [],
  },
  {
    id: "flowers-decor",
    occasions: ["ngay-thuong", "xin-loi-lam-hoa", "cam-on", "tan-gia-goc-song-moi"],
    styles: ["toi-gian", "lang-man", "am-ap", "nghe-thuat"],
    budgetTier: "1m-3m",
    giftType: "vat-pham",
    items: [],
  },
  {
    id: "dream-trips",
    occasions: ["ky-niem", "yeu-xa-doan-tu", "cau-hon-cam-ket", "tet-nam-moi"],
    styles: ["lang-man", "sang-trong", "trai-nghiem"],
    budgetTier: "tren-10m",
    giftType: "trai-nghiem",
    items: [],
  },
];

const itemProfiles = {
  "gift-jo-malone-peony": {
    occasions: ["sinh-nhat", "ky-niem", "valentine"],
    styles: ["nu-tinh", "thanh-lich", "sang-trong"],
    budgetTier: "3m-10m",
    giftType: "vat-pham",
  },
  "gift-personalized-necklace": {
    occasions: ["ky-niem", "valentine", "cau-hon-cam-ket"],
    styles: ["lang-man", "ca-nhan-hoa", "thu-cong"],
    budgetTier: "1m-3m",
    giftType: "ca-nhan-hoa",
  },
  "gift-seasonal-bouquet": {
    occasions: ["ngay-thuong", "quoc-te-phu-nu", "phu-nu-viet-nam", "xin-loi-lam-hoa"],
    styles: ["nu-tinh", "lang-man", "am-ap"],
    budgetTier: "500k-1m",
    giftType: "vat-pham",
  },
  "gift-instax-mini-12": {
    occasions: ["sinh-nhat", "tot-nghiep-cong-viec-moi", "yeu-xa-doan-tu"],
    styles: ["ca-tinh", "cong-nghe", "thiet-thuc"],
    budgetTier: "3m-10m",
    giftType: "vat-pham",
  },
  "gift-diptyque-baies": {
    occasions: ["ngay-thuong", "giang-sinh", "tan-gia-goc-song-moi"],
    styles: ["toi-gian", "am-ap", "sang-trong"],
    budgetTier: "1m-3m",
    giftType: "vat-pham",
  },
  "gift-custom-cake": {
    occasions: ["sinh-nhat", "ky-niem", "cam-on"],
    styles: ["ca-nhan-hoa", "nghe-thuat", "thu-cong"],
    budgetTier: "500k-1m",
    giftType: "tu-lam",
  },
  "gift-photo-book": {
    occasions: ["ky-niem", "yeu-xa-doan-tu", "cam-on"],
    styles: ["ca-nhan-hoa", "am-ap", "thu-cong"],
    budgetTier: "500k-1m",
    giftType: "ca-nhan-hoa",
  },
  "gift-lego-tulip": {
    occasions: ["ngay-thuong", "valentine", "co-vu-chua-lanh"],
    styles: ["ca-tinh", "nghe-thuat", "thu-cong"],
    budgetTier: "500k-1m",
    giftType: "tu-lam",
  },
  "gift-spa-day": {
    occasions: ["sinh-nhat", "quoc-te-phu-nu", "phu-nu-viet-nam", "co-vu-chua-lanh"],
    styles: ["thiet-thuc", "sang-trong", "trai-nghiem"],
    budgetTier: "1m-3m",
    giftType: "trai-nghiem",
  },
  "gift-candlelight-dinner": {
    occasions: ["ky-niem", "valentine", "xin-loi-lam-hoa"],
    styles: ["lang-man", "am-ap", "trai-nghiem"],
    budgetTier: "1m-3m",
    giftType: "trai-nghiem",
  },
  "gift-airpods-playlist": {
    occasions: ["sinh-nhat", "ngay-thuong", "yeu-xa-doan-tu"],
    styles: ["cong-nghe", "ca-nhan-hoa", "thiet-thuc"],
    budgetTier: "3m-10m",
    giftType: "ca-nhan-hoa",
  },
  "gift-surprise-weekend": {
    occasions: ["sinh-nhat", "ky-niem", "yeu-xa-doan-tu"],
    styles: ["lang-man", "sang-trong", "trai-nghiem"],
    budgetTier: "tren-10m",
    giftType: "trai-nghiem",
  },
};

const taxonomy = {
  occasions: [
    ["ngay-thuong", "Chỉ vì hôm nay"],
    ["sinh-nhat", "Sinh nhật"],
    ["ky-niem", "Kỷ niệm của hai đứa"],
    ["valentine", "Valentine"],
    ["quoc-te-phu-nu", "Quốc tế Phụ nữ 8/3"],
    ["phu-nu-viet-nam", "Phụ nữ Việt Nam 20/10"],
    ["giang-sinh", "Giáng sinh"],
    ["tet-nam-moi", "Tết & năm mới"],
    ["tot-nghiep-cong-viec-moi", "Tốt nghiệp & công việc mới"],
    ["xin-loi-lam-hoa", "Xin lỗi & làm hòa"],
    ["co-vu-chua-lanh", "Cổ vũ một ngày khó"],
    ["cam-on", "Cảm ơn vì có em"],
    ["yeu-xa-doan-tu", "Yêu xa & ngày gặp lại"],
    ["cau-hon-cam-ket", "Lời hứa & cầu hôn"],
    ["tan-gia-goc-song-moi", "Góc sống mới"],
  ].map(([id, label]) => ({ id, label })),
  styles: [
    ["toi-gian", "Tối giản"],
    ["nu-tinh", "Nữ tính"],
    ["thanh-lich", "Thanh lịch"],
    ["lang-man", "Lãng mạn"],
    ["ca-tinh", "Cá tính"],
    ["co-dien", "Cổ điển"],
    ["am-ap", "Ấm áp"],
    ["thiet-thuc", "Thiết thực"],
    ["sang-trong", "Sang trọng"],
    ["nghe-thuat", "Nghệ thuật"],
    ["cong-nghe", "Công nghệ"],
    ["thu-cong", "Thủ công"],
    ["trai-nghiem", "Trải nghiệm"],
    ["ca-nhan-hoa", "Cá nhân hóa"],
  ].map(([id, label]) => ({ id, label })),
  budgets: [
    ["duoi-500k", "Dưới 500 nghìn"], ["500k-1m", "500 nghìn – 1 triệu"],
    ["1m-3m", "1 – 3 triệu"], ["3m-10m", "3 – 10 triệu"],
    ["tren-10m", "Trên 10 triệu"], ["linh-hoat", "Ngân sách linh hoạt"],
  ].map(([id, label]) => ({ id, label })),
  giftTypes: [
    ["vat-pham", "Món đồ"], ["trai-nghiem", "Trải nghiệm"],
    ["ca-nhan-hoa", "Cá nhân hóa"], ["tu-lam", "Tự tay chuẩn bị"],
  ].map(([id, label]) => ({ id, label })),
};

const oldManifest = JSON.parse(fs.readFileSync(path.join(dataDir, "preferences.json"), "utf8"));
const existingById = new Map();
for (const url of oldManifest.categories) {
  const file = path.join(root, "public", url.replace(/^\//, ""));
  if (fs.existsSync(file)) {
    const category = JSON.parse(fs.readFileSync(file, "utf8"));
    existingById.set(category.id, category);
  }
}
const existingItemById = new Map(
  [...existingById.values()].flatMap((category) =>
    category.items.map((item) => [item.id, item]),
  ),
);

const collectionDefinitions = [
  {
    id: "nho-ma-cham",
    name: "Nhỏ mà chạm",
    description: "Những điều tinh tế cho một ngày bình thường bỗng trở nên đáng nhớ.",
    occasionIds: ["ngay-thuong", "co-vu-chua-lanh", "cam-on"],
    itemIds: ["gift-seasonal-bouquet", "gift-diptyque-baies", "gift-lego-tulip", "gift-photo-book", "decor-champagne-minimal"],
    imageItemId: "gift-seasonal-bouquet",
  },
  {
    id: "sinh-nhat-dung-gu",
    name: "Sinh nhật đúng gu",
    description: "Một tuyển tập vừa đủ bất ngờ, vừa thật gần với phong cách của em.",
    occasionIds: ["sinh-nhat"],
    itemIds: ["gift-jo-malone-peony", "gift-instax-mini-12", "gift-custom-cake", "gift-spa-day", "gift-airpods-playlist", "dress-zimmermann-como"],
    imageItemId: "gift-custom-cake",
  },
  {
    id: "ky-niem-cua-chung-minh",
    name: "Kỷ niệm của chúng mình",
    description: "Gợi lại câu chuyện đã có và mở ra thêm một kỷ niệm mới.",
    occasionIds: ["ky-niem"],
    itemIds: ["gift-personalized-necklace", "gift-candlelight-dinner", "gift-photo-book", "jewelry-tiffany-knot", "trip-paris-slow-days"],
    imageItemId: "gift-candlelight-dinner",
  },
  {
    id: "valentine-khong-rap-khuon",
    name: "Valentine không rập khuôn",
    description: "Lãng mạn theo cách riêng, không cần giống bất kỳ ai.",
    occasionIds: ["valentine"],
    itemIds: ["gift-jo-malone-peony", "gift-personalized-necklace", "gift-seasonal-bouquet", "gift-candlelight-dinner", "jewelry-tiffany-lock"],
    imageItemId: "jewelry-tiffany-lock",
  },
  {
    id: "ngay-cua-em",
    name: "Một ngày dành cho em",
    description: "Những lựa chọn thanh lịch để em được chiều chuộng theo cách mình thích.",
    occasionIds: ["quoc-te-phu-nu", "phu-nu-viet-nam"],
    itemIds: ["gift-seasonal-bouquet", "gift-spa-day", "dress-prada-linen-midi", "bag-valentino-vlogo-top-handle", "shoes-manolo-hangisi-flat"],
    imageItemId: "dress-prada-linen-midi",
  },
  {
    id: "xin-loi-that-diu-dang",
    name: "Làm hòa thật dịu dàng",
    description: "Một lời xin lỗi chân thành đi cùng khoảng thời gian để mình lắng nghe nhau.",
    occasionIds: ["xin-loi-lam-hoa"],
    itemIds: ["gift-seasonal-bouquet", "gift-candlelight-dinner", "gift-photo-book", "decor-wine-candlelight"],
    imageItemId: "decor-wine-candlelight",
  },
  {
    id: "yeu-xa-ngay-gap-lai",
    name: "Yêu xa & ngày gặp lại",
    description: "Giữ những điều gần gũi ở bên nhau, dù khoảng cách có dài đến đâu.",
    occasionIds: ["yeu-xa-doan-tu"],
    itemIds: ["gift-instax-mini-12", "gift-photo-book", "gift-airpods-playlist", "gift-surprise-weekend", "trip-paris-slow-days"],
    imageItemId: "trip-paris-slow-days",
  },
  {
    id: "loi-hua-lau-dai",
    name: "Một lời hứa lâu dài",
    description: "Những biểu tượng dành cho một cột mốc nghiêm túc và thật nhiều yêu thương.",
    occasionIds: ["cau-hon-cam-ket"],
    itemIds: ["gift-personalized-necklace", "jewelry-tiffany-knot", "jewelry-tiffany-lock", "trip-maldives-private-island", "gift-candlelight-dinner"],
    imageItemId: "jewelry-tiffany-knot",
  },
  {
    id: "khoi-dau-moi",
    name: "Chúc mừng khởi đầu mới",
    description: "Tiếp thêm niềm vui cho công việc, mái ấm hoặc hành trình vừa bắt đầu.",
    occasionIds: ["tot-nghiep-cong-viec-moi", "tet-nam-moi", "tan-gia-goc-song-moi"],
    itemIds: ["gift-instax-mini-12", "gift-diptyque-baies", "bag-loewe-amazona-180", "decor-champagne-minimal", "gift-spa-day"],
    imageItemId: "decor-champagne-minimal",
  },
];

const collections = collectionDefinitions.map(({ imageItemId, ...collection }) => {
  const imageItem = existingItemById.get(imageItemId);
  const missingItemId = collection.itemIds.find(
    (itemId) => !existingItemById.has(itemId),
  );
  if (missingItemId) throw new Error(`Missing collection item: ${missingItemId}`);
  if (!imageItem) throw new Error(`Missing collection image item: ${imageItemId}`);
  return {
    ...collection,
    imageUrl: imageItem.imageUrl,
    imageAlt: imageItem.imageAlt,
  };
});


let imageLock = 1200;
const categoryUrls = [];
for (const definition of definitions) {
  const existing = existingById.get(definition.id);
  const baseItems = existing?.items ?? [];
  const defaults = {
    occasions: definition.occasions,
    styles: definition.styles,
    budgetTier: definition.budgetTier,
    giftType: definition.giftType,
  };
  const enriched = baseItems.map((item, index) => {
    const profile = itemProfiles[item.id] ?? {};
    return {
      ...defaults,
      whyItFits: item.whyItFits ?? item.description,
      messageTitle: item.messageTitle ?? "Một lời nhắn cho em",
      editorialOrder: item.editorialOrder ?? index + 1,
      featured: item.featured ?? index < 2,
      ...item,
      ...profile,
    };
  });
  const knownNames = new Set(enriched.map((item) => item.name.toLocaleLowerCase("vi-VN")));
  const additions = definition.items
    .filter((name) => !knownNames.has(name.toLocaleLowerCase("vi-VN")))
    .slice(0, Math.max(0, 14 - enriched.length))
    .map((name, index) => {
      imageLock += 1;
      const itemNumber = enriched.length + index + 1;
      return {
        id: `${definition.id}-${slugify(name)}`,
        name,
        description: `${name} là một gợi ý ${definition.editorial}, giúp em hình dung phong cách trước khi chia sẻ điều mình thích.`,
        whyItFits: `${definition.reason} Đây chỉ là lựa chọn tham khảo, không phải lời đề nghị mua ngay.`,
        imageUrl: `https://loremflickr.com/1024/1280/${definition.keywords}?lock=${imageLock}`,
        imageAlt: `${name} theo phong cách ${definition.tags[0].toLocaleLowerCase("vi-VN")}`,
        brand: definition.sourceName,
        sourceName: definition.sourceName,
        sourceUrl: definition.sourceUrl,
        messageTitle: `Nếu em chọn ${name}`,
        message: `Anh đặt ${name.toLocaleLowerCase("vi-VN")} vào đây như một gợi ý nhỏ.\nNếu đúng với gu của em, chỉ cần để lại một trái tim; phần còn lại anh sẽ ghi nhớ.`,
        tags: definition.tags,
        ...defaults,
        featured: itemNumber <= 2,
        editorialOrder: itemNumber,
      };
    });
  const category = {
    id: definition.id,
    name: existing.name,
    description: existing.description,
    notePlaceholder: existing.notePlaceholder,
    coverImage: existing.coverImage ?? enriched[0]?.imageUrl ?? additions[0]?.imageUrl,
    coverAlt:
      existing.coverAlt ??
      `Ảnh đại diện ${existing.name.toLocaleLowerCase("vi-VN")}`,
    items: [...enriched, ...additions].slice(0, 14),
  };
  const fileName = `${definition.id}.json`;
  fs.writeFileSync(path.join(categoryDir, fileName), `${JSON.stringify(category, null, 2)}\n`);
  categoryUrls.push(`/data/categories/${fileName}`);
}

const manifest = {
  ...oldManifest,
  categories: categoryUrls.length > 0 ? categoryUrls : oldManifest.categories,
  taxonomy,
  collections,
};
fs.writeFileSync(
  path.join(dataDir, "preferences.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
