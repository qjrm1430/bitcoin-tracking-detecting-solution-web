import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";

export async function GET() {
  await dbConnect();

  try {
    const user = await User.find();

    if (user) {
      return NextResponse.json(user);
    } else {
      console.error(`user not found.`);
      return NextResponse.json({ error: `user Not Found` }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching tabs:", error);
  }
}
