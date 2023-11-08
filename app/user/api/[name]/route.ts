import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: { name: string } },
) {
  await dbConnect();

  try {
    const user = await User.findOne({ name: params.name });

    if (user) {
      return NextResponse.json(user);
    } else {
      console.error(`${params.name} not found.`);
      return NextResponse.json(
        { error: `${params.name} is Not Found` },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error fetching tabs:", error);
  }
}
