import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/shareholders
// 获取所有股东列表（管理后台使用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('shareholders')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: shareholders, error } = await query;

    if (error) {
      console.error('Fetch shareholders error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shareholders' },
        { status: 500 }
      );
    }

    return NextResponse.json(shareholders || []);
  } catch (error) {
    console.error('Shareholders GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/shareholders
// 创建新股东
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, share_percent, actual_investment_rm, points_balance } = body;

    if (!name || !phone || !share_percent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 生成会员编号和推荐码
    const { data: existingShareholders } = await supabase
      .from('shareholders')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    const nextId = (existingShareholders?.[0]?.id || 0) + 1;
    const prefix = share_percent >= 20 ? 'FP' : 
                   share_percent >= 10 ? 'CR' :
                   share_percent >= 5 ? 'ST' :
                   share_percent >= 3 ? 'LS' : 'SU';
    const memberNo = `SFD6-${prefix}-${String(nextId).padStart(3, '0')}`;

    // 确定等级
    const tier = share_percent >= 20 ? 'Founding Partner' :
                 share_percent >= 10 ? 'Core Shareholder' :
                 share_percent >= 5 ? 'Strategic Shareholder' :
                 share_percent >= 3 ? 'Lifestyle Shareholder' : 'Support Shareholder';

    // 每周积分
    const weeklyPoints = share_percent >= 20 ? 300 :
                        share_percent >= 10 ? 150 :
                        share_percent >= 5 ? 80 :
                        share_percent >= 3 ? 50 : 30;

    const { data: newShareholder, error } = await supabase
      .from('shareholders')
      .insert([{
        member_no: memberNo,
        name,
        phone,
        email,
        share_percent,
        actual_investment_rm: actual_investment_rm || share_percent * 9600,
        points_balance: points_balance || actual_investment_rm || share_percent * 9600,
        tier,
        weekly_points: weeklyPoints,
        referral_code: `${memberNo}-2026`,
        is_active: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Create shareholder error:', error);
      return NextResponse.json(
        { error: 'Failed to create shareholder' },
        { status: 500 }
      );
    }

    return NextResponse.json(newShareholder);
  } catch (error) {
    console.error('Shareholders POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
