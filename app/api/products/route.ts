import { getProductCards } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json({ data: await getProductCards() });
  } catch (error) {
    console.error("Unable to load product catalogue", error);
    return Response.json(
      {
        error: {
          code: "CATALOGUE_UNAVAILABLE",
          message: "The catalogue is unavailable right now. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}
