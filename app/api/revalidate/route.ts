import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path")

    if (!path) {
      return NextResponse.json({ message: "Missing path parameter" }, { status: 400 })
    }

    // Revalidate the specific path
    revalidatePath(path)

    // Also revalidate the home page as it might show latest content
    revalidatePath("/")

    return NextResponse.json({ revalidated: true, message: `Revalidated: ${path}` }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Error revalidating", error }, { status: 500 })
  }
}

