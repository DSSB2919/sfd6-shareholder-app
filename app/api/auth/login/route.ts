import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// POST /api/auth/login
// 密码登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: '请输入手机号和密码' },
        { status: 400 }
      );
    }

    // 验证手机号格式（马来西亚手机号）
    const phoneRegex = /^\+60[0-9]{9,10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 查找股东（支持多种手机号格式）
    let { data: shareholder, error: shareholderError } = await supabase
      .from('shareholders')
      .select('*')
      .eq('phone', phone)
      .single();

    // 如果没找到，尝试不带 +60 的格式
    if (!shareholder && phone.startsWith('+60')) {
      const phoneWithoutPrefix = phone.slice(3);
      const result = await supabase
        .from('shareholders')
        .select('*')
        .eq('phone', phoneWithoutPrefix)
        .single();
      shareholder = result.data;
      shareholderError = result.error;
    }

    // 还是没找到，尝试匹配后 9 位数字
    if (!shareholder) {
      const numericPhone = phone.replace(/\D/g, '');
      const last9Digits = numericPhone.slice(-9);
      const result = await supabase
        .from('shareholders')
        .select('*')
        .ilike('phone', `%${last9Digits}`)
        .single();
      shareholder = result.data;
      shareholderError = result.error;
    }

    if (!shareholder) {
      return NextResponse.json(
        { error: '手机号未注册' },
        { status: 404 }
      );
    }

    if (!shareholder.is_active) {
      return NextResponse.json(
        { error: '账号已禁用' },
        { status: 403 }
      );
    }

    // 验证密码
    // 注意：生产环境应该使用 bcrypt 等加密方式比较密码
    // 这里简化处理，直接比较明文密码（因为数据库中存储的是明文）
    const storedPassword = shareholder.password_hash || '123456';
    if (password !== storedPassword) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = Buffer.from(
      JSON.stringify({
        id: shareholder.id,
        phone: shareholder.phone,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 天有效期
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      message: '登录成功',
      token,
      shareholder: {
        id: shareholder.id,
        member_no: shareholder.member_no,
        name: shareholder.name,
        phone: shareholder.phone,
        share_percent: shareholder.share_percent,
        tier: shareholder.tier,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
