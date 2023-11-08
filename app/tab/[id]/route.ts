import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies();
  const userid = cookieStore.get("uid");
  await dbConnect();

  try {
    const response = await User.findOneAndUpdate(
      { name: userid?.value },
      {
        $pull: {
          tab: {
            _id: new mongoose.Types.ObjectId(params.id),
          },
        },
      },
      {
        new: true,
      },
    );
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies();
  const uid = cookieStore.get("uid");
  const body = await request.json();
  await dbConnect();
  try {
    const response = await User.findOneAndUpdate(
      { name: uid?.value, "tab._id": new mongoose.Types.ObjectId(params.id) },
      { $set: { "tab.$.name": body.name } },
      { new: true },
    );
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
