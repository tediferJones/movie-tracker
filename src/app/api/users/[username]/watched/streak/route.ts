import { db } from "@/drizzle/db";
import { watched } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type Params = { username: string }

const oneDay = 1000 * 60 * 60 * 24;

function normalizeDate(time: number) {
  // set date to midnight on the same day
  return (new Date(time)).setHours(0, 0, 0, 0)
}

// this should be extracted to src/lib/getStreak.ts
function traceStreak(
  dates: number[],
  prevDate: number,
  index = 0,
  multiMovieDays = 0,
) {
  if (!dates[index]) return index - multiMovieDays
  const nextDate = dates[index]
  const timeDiff = prevDate - nextDate
  // console.log(new Date(prevDate).toString(), new Date(nextDate).toString())
  if (timeDiff <= 0) {
    // multi movie day, doesnt count towards streak
    // console.log('multi movie day')
    return traceStreak(dates, normalizeDate(nextDate), index + 1, multiMovieDays + 1)
  }
  if (timeDiff > oneDay) return index - multiMovieDays
  return traceStreak(dates, normalizeDate(nextDate), index + 1, multiMovieDays)
}

export async function GET(req: Request, { params }: { params: Params }) {
  const { username } = params;

  // Ideally this will be replaced by the streak table,
  // then recalculate streak everytime a new watch record is added
  //  - might be a bad idea, if user just doesnt post any more watch records
  //    the streak will remain intact until they post a bad record
  //
  // Also might contain an off-by-one error,
  // if user watches a movie at 11PM yesterday, the streak is still valid until after 11:59:59 today
  try {
    const watchRecs = await db.select({ date: watched.date }).from(watched).where(
      eq(watched.username, username)
    ).orderBy(desc(watched.date));
    // const timeStamps = watchRecs.map(rec => rec.date).slice(3);
    // const startDate = (new Date(watchRecs[3].date + 1000 * 60 * 60 * 24)).setHours(0, 0, 0, 0)
    // console.log('start date', new Date(startDate).toString())
    const timeStamps = watchRecs.map(rec => rec.date);
    const startDate = normalizeDate(Date.now() + oneDay);
    return NextResponse.json(traceStreak(timeStamps, startDate));
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
