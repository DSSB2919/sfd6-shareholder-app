import { NextRequest, NextResponse } from 'next/server';

// 简单的管理员账号（生产环境应该使用数据库）
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

// POST /api/admin/login
// 管理员登录
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

    // 验证账号
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成简单的 token（生产环境应该使用 JWT）
    const token = Buffer.from(
      JSON.stringify({
        username,
        role: 'admin',
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24小时有效期
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      message: '登录成功',
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
