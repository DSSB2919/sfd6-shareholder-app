import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Shareholder } from '@/types';

// GET /api/shareholder
// 获取当前登录股东信息
// 实际项目中应该通过 JWT token 或 session 识别用户
export async function GET(request: NextRequest) {
  try {
    // TODO: 从 JWT token 或 session 中获取当前用户ID
    // 临时使用 shareholder_id 参数，实际应该通过认证信息获取
    const { searchParams } = new URL(request.url);
    const shareholderId = searchParams.get('id');

    if (!shareholderId) {
      // 如果没有提供ID，返回第一个股东（仅用于开发测试）
      const { data: firstShareholder, error: firstError } = await supabase
        .from('shareholders')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

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
    }

    // 查询指定股东
    const { data: shareholder, error } = await supabase
      .from('shareholders')
      .select('*')
      .eq('id', shareholderId)
      .eq('is_active', true)
      .single();

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

    // 只允许更新特定字段
    const allowedFields = ['name', 'email', 'phone'];
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
