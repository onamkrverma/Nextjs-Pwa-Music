import Users from "@/models/users";
import connectDB from "@/utils/db";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {
    if (!id) {
      return NextResponse.json(
        {
          error: "The user id is required in ':id' params",
        },
        { status: 404 }
      );
    }
    await connectDB();

    const user = await Users.findById(id, { likedSongIds: 1 });

    if (!user) {
      return NextResponse.json(
        { error: "User does not exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(user.likedSongIds, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      }
    );
  }
};

interface RequestBody {
  songIds: string[];
}

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { songIds }: RequestBody = await request.json();

  try {
    if (!songIds.length) {
      return NextResponse.json(
        { error: "The songIds array is required in request body" },
        { status: 404 }
      );
    }

    await connectDB();

    await Users.updateOne({ _id: id }, { $set: { likedSongIds: songIds } });

    return NextResponse.json(
      {
        message: "Liked songs updated",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
