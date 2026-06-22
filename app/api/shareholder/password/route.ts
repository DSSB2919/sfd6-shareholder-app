import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT /api/shareholder/password
// 修改股东密码
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareholder_id, current_password, new_password } = body;

    if (!shareholder_id || !current_password || !new_password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // 获取股东当前密码
    const { data: shareholder, error: fetchError } = await supabase
      .from('shareholders')
      .select('id, password_hash')
      .eq('id', shareholder_id)
      .single();

    if (fetchError || !shareholder) {
      return NextResponse.json(
        { error: 'Shareholder not found' },
        { status: 404 }
      );
    }

    // 验证当前密码（明文比较，生产环境应该用 bcrypt）
    // 如果数据库中没有密码，使用默认密码 "123456"
    const storedPassword = shareholder.password_hash || '123456';
    if (storedPassword !== current_password) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // 更新密码
    const { error: updateError } = await supabase
      .from('shareholders')
      .update({ password_hash: new_password })
      .eq('id', shareholder_id);

    if (updateError) {
      console.error('Update password error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
