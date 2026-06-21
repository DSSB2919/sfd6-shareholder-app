import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 查询所有股东
    const { data: shareholders, error } = await supabase
      .from('shareholders')
      .select('id, name, phone, is_active');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: shareholders?.length || 0,
      shareholders: shareholders || []
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
