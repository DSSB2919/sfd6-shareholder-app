import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Shareholder } from '@/types';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// GET /api/shareholder
// 获取当前登录股东信息
// 支持两种方式：1. 通过 id 参数指定股东 2. 通过 phone 参数获取当前登录股东
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareholderId = searchParams.get('id');
    const phone = searchParams.get('phone');

    // 如果提供了ID，直接查询指定股东
    if (shareholderId) {
      const { data: shareholder, error } = await supabase
        .from('shareholders')
        .select('*')
        .eq('id', shareholderId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Fetch shareholder error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch shareholder' },
          { status: 500 }
        );
      }

      if (!shareholder) {
        return NextResponse.json(
          { error: 'Shareholder not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(shareholder);
    }

    // 如果提供了手机号，查询对应股东（用于股东端获取当前登录用户）
    if (phone) {
      const { data: shareholder, error } = await supabase
        .from('shareholders')
        .select('*')
        .eq('phone', phone)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Fetch shareholder by phone error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch shareholder' },
          { status: 500 }
        );
      }

      if (!shareholder) {
        return NextResponse.json(
          { error: 'Shareholder not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(shareholder);
    }

    // 如果没有提供任何参数，返回第一个股东（仅用于开发测试）
    const { data: firstShareholder, error: firstError } = await supabase
      .from('shareholders')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (firstError) {
      console.error('Fetch first shareholder error:', firstError);
      return NextResponse.json(
        { error: 'Failed to fetch shareholder' },
        { status: 500 }
      );
    }

    if (!firstShareholder) {
      return NextResponse.json(
        { error: 'No active shareholder found' },
        { status: 404 }
      );
    }

    return NextResponse.json(firstShareholder);
  } catch (error) {
    console.error('Shareholder GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/shareholder
// 更新股东信息（仅允许更新部分字段）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing shareholder id' },
        { status: 400 }
      );
    }

    // 允许更新的字段（包括股东编号和推荐码）
    const allowedFields = ['name', 'email', 'phone', 'member_no', 'referral_code', 'share_percent', 'actual_investment_rm', 'points_balance', 'tier'];
    const filteredData: Record<string, unknown> = {};
    
    for (const key of allowedFields) {
      if (key in updateData) {
        filteredData[key] = updateData[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: updatedShareholder, error } = await supabase
      .from('shareholders')
      .update(filteredData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update shareholder error:', error);
      return NextResponse.json(
        { error: 'Failed to update shareholder' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedShareholder);
  } catch (error) {
    console.error('Shareholder PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
