import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppOTP } from '@/lib/whatsapp';

// 生成 6 位数字验证码
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/otp/send
// 发送 OTP 到指定手机号
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Missing phone number' },
        { status: 400 }
      );
    }

    // 验证手机号格式（马来西亚手机号）
    const phoneRegex = /^\+60[0-9]{9,10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +60XXXXXXXXX' },
        { status: 400 }
      );
    }

    // 检查手机号是否存在于股东表中
    const { data: shareholder, error: shareholderError } = await supabase
      .from('shareholders')
      .select('id, phone, is_active')
      .eq('phone', phone)
      .single();

    if (shareholderError || !shareholder) {
      return NextResponse.json(
        { error: 'Phone number not registered' },
        { status: 404 }
      );
    }

    if (!shareholder.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    // 生成 OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 分钟有效期

    // 保存到数据库
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert([
        {
          phone,
          code: otp,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
        },
      ]);

    if (insertError) {
      console.error('Insert OTP error:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    }

    // 调用 WhatsApp API 发送 OTP
    const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
    const whatsappSent = await sendWhatsAppOTP(phone, otp);
    
    if (!whatsappSent && !IS_DEVELOPMENT) {
      // 如果发送失败且不是开发环境，返回错误
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // 开发环境返回 OTP，生产环境移除
      debug_otp: IS_DEVELOPMENT ? otp : undefined,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/otp/verify
// 验证 OTP
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Missing phone or code' },
        { status: 400 }
      );
    }

    // 调用数据库函数验证 OTP
    const { data: isValid, error: verifyError } = await supabase
      .rpc('verify_otp', {
        p_phone: phone,
        p_code: code,
      });

    if (verifyError) {
      console.error('Verify OTP error:', verifyError);
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // 获取股东信息
    const { data: shareholder, error: shareholderError } = await supabase
      .from('shareholders')
      .select('*')
      .eq('phone', phone)
      .single();

    if (shareholderError || !shareholder) {
      return NextResponse.json(
        { error: 'Shareholder not found' },
        { status: 404 }
      );
    }

    // 生成 JWT token（简化版，生产环境使用 proper JWT）
    const token = Buffer.from(
      JSON.stringify({
        id: shareholder.id,
        phone: shareholder.phone,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 天有效期
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      message: 'Login successful',
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
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
