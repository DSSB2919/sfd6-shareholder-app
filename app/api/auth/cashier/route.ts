import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// POST /api/auth/cashier
// 收银员登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '请输入用户名和密码' },
        { status: 400 }
      );
    }

    // 查找收银员
    const { data: cashier, error } = await supabase
      .from('cashiers')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Cashier login error:', error);
      return NextResponse.json(
        { error: '服务器错误' },
        { status: 500 }
      );
    }

    if (!cashier) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    if (!cashier.is_active) {
      return NextResponse.json(
        { error: '账号已禁用' },
        { status: 403 }
      );
    }

    // 验证密码
    if (password !== cashier.password_hash) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT token - 有效期 10 分钟
    const TOKEN_EXPIRY_MS = 10 * 60 * 1000;
    const token = Buffer.from(
      JSON.stringify({
        id: cashier.id,
        username: cashier.username,
        is_admin: cashier.is_admin,
        exp: Date.now() + TOKEN_EXPIRY_MS,
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      message: '登录成功',
      token,
      cashier: {
        id: cashier.id,
        username: cashier.username,
        name: cashier.name,
        is_admin: cashier.is_admin,
      },
    });
  } catch (error) {
    console.error('Cashier login error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
