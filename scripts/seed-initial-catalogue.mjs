import { createClient } from "@supabase/supabase-js";

const sourceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!sourceUrl || !secretKey) {
  throw new Error("Server write configuration is missing.");
}

const client = createClient(sourceUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const categories = [
  {
    slug: "qua-tang-nho",
    name: "Quà tặng nhỏ mà chạm",
    description: "Những lựa chọn dịu dàng để nói điều khó nói thành lời.",
    icon: null,
    cover_image_url: null,
    sort_order: 10,
    is_active: true,
    created_by: null,
  },
  {
    slug: "hen-ho-de-nho",
    name: "Một buổi hẹn để nhớ",
    description: "Để một bữa tối, một dòng sông hay góc phố trở thành kỷ niệm.",
    icon: null,
    cover_image_url: null,
    sort_order: 20,
    is_active: true,
    created_by: null,
  },
  {
    slug: "chuyen-di-cho-hai",
    name: "Một chuyến đi cho hai",
    description: "Những hành trình chậm rãi, đủ để mình ở cạnh nhau lâu hơn.",
    icon: null,
    cover_image_url: null,
    sort_order: 30,
    is_active: true,
    created_by: null,
  },
];

const initialItems = [
  {
    categorySlug: "qua-tang-nho",
    slug: "maison-marou-hop-qua-sau-huong-vi",
    kind: "product",
    title: "Maison Marou — Hộp quà 6 hương vị",
    summary: "Một hộp sô-cô-la thủ công Việt Nam cho những ngày cần một lời nhắn ngọt ngào.",
    description:
      "Maison Marou giới thiệu hộp quà gồm sáu hương vị sô-cô-la Việt Nam. Giá và tình trạng bán được xem trực tiếp tại trang chính thức.",
    sourceTitle: "Trang chính thức Maison Marou",
    sourceUrl: "https://maisonmarou.com/",
    linkType: "shopping",
  },
  {
    categorySlug: "qua-tang-nho",
    slug: "aesop-resurrection-duet",
    kind: "product",
    title: "Aesop — Resurrection Duet",
    summary: "Bộ đôi làm sạch và dưỡng ẩm tay với hương cam chanh, gỗ và thảo mộc.",
    description:
      "Resurrection Duet là một bộ quà tặng tay và cơ thể của Aesop. Hãy kiểm tra trang chính thức để biết khu vực giao hàng và giá hiện tại.",
    sourceTitle: "Aesop Gifts & Kits",
    sourceUrl: "https://www.aesop.com/gifts/kits-and-sets/?geo=false",
    linkType: "shopping",
  },
  {
    categorySlug: "qua-tang-nho",
    slug: "diptyque-baies-classic-candle",
    kind: "product",
    title: "Diptyque — Baies Classic Candle",
    summary: "Một hương nến kết hợp quả mọng đen và hoa hồng cho những buổi tối ở nhà.",
    description:
      "Baies là một trong các hương nến nổi bật của Diptyque. Giá, kích thước và khả năng giao hàng thay đổi theo khu vực.",
    sourceTitle: "Diptyque Candles & Home",
    sourceUrl: "https://www.diptyqueparis.com/en_eu/c/candles-and-home-collections.html",
    linkType: "shopping",
  },
  {
    categorySlug: "qua-tang-nho",
    slug: "lego-botanicals",
    kind: "product",
    title: "LEGO Botanicals — Một bó hoa để cùng lắp",
    summary: "Một món quà vừa để làm cùng nhau, vừa để giữ lại thật lâu trong góc phòng.",
    description:
      "LEGO Botanicals có các bộ hoa và cây trang trí. Danh mục, mức giá và độ tuổi phù hợp được cập nhật trên trang LEGO chính thức.",
    sourceTitle: "LEGO Botanicals",
    sourceUrl: "https://www.lego.com/en-us/themes/botanicals/about",
    linkType: "shopping",
  },
  {
    categorySlug: "hen-ho-de-nho",
    slug: "lusine-eatery",
    kind: "place",
    title: "L'Usine Eatery",
    summary: "Một lựa chọn cho bữa tối chậm rãi với thực đơn Âu hiện đại tại không gian L'Usine.",
    description:
      "The Eatery là nhà hàng thuộc L'Usine. Hãy xem trang chính thức để chọn cơ sở, kiểm tra giờ mở cửa và thực đơn mới nhất.",
    sourceTitle: "L'Usine Eatery",
    sourceUrl: "https://lusinespace.com/eat/eatery/",
    linkType: "website",
  },
  {
    categorySlug: "hen-ho-de-nho",
    slug: "anantara-hoi-an",
    kind: "place",
    title: "Anantara Hoi An Resort",
    summary: "Một đêm ven sông Thu Bồn, gần phố cổ Hội An và những chuyến đi ngắm hoàng hôn.",
    description:
      "Anantara Hoi An là lựa chọn nghỉ dưỡng ven sông, cách phố cổ chưa đến một kilomet theo thông tin từ trang chính thức.",
    address: "1 Pham Hong Thai Street, Hoi An Ward, Da Nang City",
    sourceTitle: "Anantara Hoi An Resort",
    sourceUrl: "https://www.anantara.com/en/hoi-an",
    linkType: "website",
  },
  {
    categorySlug: "chuyen-di-cho-hai",
    slug: "the-vietage",
    kind: "experience",
    title: "The Vietage by Anantara",
    summary: "Một hành trình tàu hạng sang qua miền Trung, để bản thân chuyến đi cũng thành kỷ niệm.",
    description:
      "The Vietage là toa tàu hạng sang của Anantara trên những cung đường miền Trung. Lịch trình và giá được cập nhật trực tiếp bởi đơn vị vận hành.",
    sourceTitle: "The Vietage by Anantara",
    sourceUrl: "https://www.thevietagetrain.com/vi/",
    linkType: "website",
  },
  {
    categorySlug: "chuyen-di-cho-hai",
    slug: "amanoi",
    kind: "place",
    title: "Amanoi",
    summary: "Một khoảng lặng bên vịnh Vĩnh Hy, giữa rừng núi và biển xanh.",
    description:
      "Amanoi nằm gần Vườn quốc gia Núi Chúa, với các pavilion và villa hướng tới trải nghiệm nghỉ dưỡng riêng tư. Xem điều kiện đặt phòng tại trang chính thức.",
    sourceTitle: "Amanoi",
    sourceUrl: "https://www.aman.com/resorts/amanoi/accommodation",
    linkType: "website",
  },
  {
    categorySlug: "chuyen-di-cho-hai",
    slug: "six-senses-ninh-van-bay",
    kind: "place",
    title: "Six Senses Ninh Van Bay",
    summary: "Một vịnh biển chỉ có thể đến bằng đường thủy, phù hợp cho một chuyến trốn khỏi nhịp thường ngày.",
    description:
      "Six Senses Ninh Van Bay là khu nghỉ dưỡng ở vịnh Ninh Vân. Chi tiết villa, trải nghiệm và lịch trống được quản lý trên trang chính thức.",
    sourceTitle: "Six Senses Ninh Van Bay",
    sourceUrl: "https://www.sixsenses.com/vn/hotels-resorts/asia-the-pacific/vietnam/ninh-van-bay/",
    linkType: "website",
  },
];

async function readCount(table) {
  const { count, error } = await client.from(table).select("id", {
    count: "exact",
    head: true,
  });

  if (error) throw new Error(`Cannot read ${table}.`);
  return count ?? 0;
}

async function main() {
  const [categoryCount, itemCount] = await Promise.all([
    readCount("categories"),
    readCount("items"),
  ]);

  if (categoryCount !== 0 || itemCount !== 0) {
    throw new Error("Initial seed only runs against an empty catalogue.");
  }

  const { data: insertedCategories, error: categoryError } = await client
    .from("categories")
    .insert(categories)
    .select("id,slug");

  if (categoryError || !insertedCategories) {
    throw new Error("Unable to create initial categories.");
  }

  const categoryIds = new Map(
    insertedCategories.map((category) => [category.slug, category.id]),
  );
  const itemRows = initialItems.map((item) => {
    const categoryId = categoryIds.get(item.categorySlug);
    if (!categoryId) throw new Error("Seed category mapping failed.");

    return {
      category_id: categoryId,
      slug: item.slug,
      kind: item.kind,
      title: item.title,
      summary: item.summary,
      description: item.description,
      address: item.address ?? null,
      latitude: null,
      longitude: null,
      map_url: null,
      price_label: null,
      external_rating: null,
      external_review_count: null,
      external_rating_source: null,
      metadata: {
        initialCuration: "2026-07-20",
        source: "official-website",
      },
      is_published: true,
      created_by: null,
    };
  });

  const { data: insertedItems, error: itemError } = await client
    .from("items")
    .insert(itemRows)
    .select("id,slug");

  if (itemError || !insertedItems) {
    await client.from("categories").delete().in(
      "id",
      insertedCategories.map((category) => category.id),
    );
    throw new Error("Unable to create initial items.");
  }

  const itemIds = new Map(insertedItems.map((item) => [item.slug, item.id]));
  const linkRows = initialItems.map((item) => {
    const itemId = itemIds.get(item.slug);
    if (!itemId) throw new Error("Seed item mapping failed.");

    return {
      item_id: itemId,
      link_type: item.linkType,
      title: item.sourceTitle,
      url: item.sourceUrl,
      sort_order: 10,
    };
  });

  const { error: linkError } = await client.from("item_links").insert(linkRows);
  if (linkError) {
    await client.from("items").delete().in(
      "id",
      insertedItems.map((item) => item.id),
    );
    await client.from("categories").delete().in(
      "id",
      insertedCategories.map((category) => category.id),
    );
    throw new Error("Unable to create initial source links.");
  }

  console.log(
    JSON.stringify({
      seeded: {
        categories: insertedCategories.length,
        items: insertedItems.length,
        links: linkRows.length,
      },
    }),
  );
}

await main();
