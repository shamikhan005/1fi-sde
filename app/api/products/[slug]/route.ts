import { getProductDetail } from "@/lib/catalog";

export const runtime = "nodejs";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  if (!slugPattern.test(slug)) {
    return Response.json(
      {
        error: {
          code: "INVALID_SLUG",
          message: "The requested product URL is invalid.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const product = await getProductDetail(slug);

    if (!product) {
      return Response.json(
        {
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "This product is not available.",
          },
        },
        { status: 404 },
      );
    }

    return Response.json({ data: product });
  } catch (error) {
    console.error("Unable to load product detail", error);
    return Response.json(
      {
        error: {
          code: "PRODUCT_UNAVAILABLE",
          message: "Product details are unavailable right now. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}
