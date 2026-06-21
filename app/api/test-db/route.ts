import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 测试 Supabase 连接
    const { data, error } = await supabase
      .from('shareholders')
      .select('count')
      .single();

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set'
      }, { status: 500 });
    }

    // 查询所有股东手机号
    const { data: shareholders, error: queryError } = await supabase
      .from('shareholders')
      .select('id, name, phone, is_active');

    if (queryError) {
      return NextResponse.json({
        status: 'error',
        message: 'Query failed',
        error: queryError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      count: shareholders?.length || 0,
      shareholders: shareholders || [],
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: String(error)
    }, { status: 500 });
  }
}
