import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/cashier/reset-password
// 重置收银员密码（仅用于开发/测试）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, newPassword } = body;

    if (!username || !newPassword) {
      return NextResponse.json(
        { error: '请输入用户名和新密码' },
        { status: 400 }
      );
    }

    // 更新密码
    const { error } = await supabase
      .from('cashiers')
      .update({ password_hash: newPassword })
      .eq('username', username);

    if (error) {
      console.error('Reset password error:', error);
      return NextResponse.json(
        { error: '重置密码失败: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `密码重置成功，用户名: ${username}, 新密码: ${newPassword}`,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
