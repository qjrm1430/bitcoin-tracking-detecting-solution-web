import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const cookieStore = cookies();
  const uid = cookieStore.get("uid");

  try {
    const user = await User.findOne({ name: uid?.value });
    if (user) {
      return NextResponse.json(user.tab);
    } else {
      console.error(`${uid?.value} not found.`);
      return NextResponse.json(
        { error: `${uid?.value} is Not Found` },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error fetching tabs:", error);
  }
}

export async function PUT(request: Request) {
  const cookieStore = cookies();
  const uid = cookieStore.get("uid");
  const body = await request.json();
  await dbConnect();

  try {
    const result = await User.findOneAndUpdate(
      { name: uid?.value },
      {
        $push: {
          tab: {
            _id: new mongoose.Types.ObjectId(),
            name: body.name,
          },
        },
      },
      { new: true },
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
