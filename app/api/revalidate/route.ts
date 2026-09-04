import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/projects', 'page');
    revalidatePath('/experiences', 'page');
    revalidatePath('/certifications', 'page');
    revalidatePath('/about', 'page');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/projects', 'page');
    revalidatePath('/experiences', 'page');
    revalidatePath('/certifications', 'page');
    revalidatePath('/about', 'page');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, error: err.message }, { status: 500 });
  }
}
