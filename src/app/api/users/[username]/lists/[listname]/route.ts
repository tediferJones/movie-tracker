import { db } from "@/drizzle/db";
import { lists } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { username: string, listname: string } }
) {
  const { username, listname } = params

  const dbResult = await db.select().from(lists).where(
    and(
      eq(lists.username, username),
      eq(lists.listname, listname),
    )
  )

  return NextResponse.json(dbResult.map(rec => rec.imdbId))
}
