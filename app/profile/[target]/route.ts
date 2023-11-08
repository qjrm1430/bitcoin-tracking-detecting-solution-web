import Flag from "@/models/Flag";
import Profile from "@/models/Profile";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

/* Put 메소드, 데이터 추가 또는 전체 데이터 수장 */
export async function PUT(
  request: Request,
  { params }: { params: { target: string } },
) {
  const data: ProfileApi.Profile = await request.json();
  await dbConnect();

  const promises = data.flags.map((flagId) => {
    return Flag.findById(flagId);
  });
  const flag = await Promise.all(promises);

  let profile = await Profile.findOne({ target: params.target });

  if (!profile) {
    profile = new Profile();
  }
  profile.target = params.target;
  profile.flags = flag;
  profile.entities = data.entities;
  profile.comment = data.comment;
  profile.save();
  return NextResponse.json(profile);
}

/* Patch 메소드, 프로파일 데이터 중 일부 데이터 변경 */
export async function PATCH(
  request: Request,
  { params }: { params: { target: string } },
) {
  const data: ProfileApi.Profile = await request.json();
  await dbConnect();

  if (data.flags) {
    const promises = data.flags.map((flagId) => {
      return Flag.findById(flagId);
    });
    const flag = await Promise.all(promises);
    await Profile.updateOne({ target: params.target }, { flags: flag });
  }
  if (data.entities) {
    await Profile.updateOne(
      { target: params.target },
      { entities: data.entities },
    );
  }
  if (data.comment) {
    await Profile.updateOne(
      { target: params.target },
      { comment: data.comment },
    );
  }

  const updateProfile = await Profile.findOne({ target: params.target });
  return NextResponse.json(updateProfile);
}

/* Delete 메소드, 파라미터 프로파일 데이터 삭제 */
export async function DELETE(
  request: Request,
  { params }: { params: { target: string } },
) {
  const res = await Profile.deleteOne({ target: params.target });
  return NextResponse.json(res);
}
