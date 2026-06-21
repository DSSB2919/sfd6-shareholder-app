import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取当前 ISO 周数
function getISOWeek(date: Date = new Date()): number {
  const tmpDate = new Date(date.valueOf());
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);
  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + ((4 - tmpDate.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000);
}

// 获取当前 ISO 年份
function getISOYear(date: Date = new Date()): number {
  const tmpDate = new Date(date.valueOf());
  tmpDate.setDate(tmpDate.getDate() - ((tmpDate.getDay() + 6) % 7) + 3);
  return tmpDate.getFullYear();
}

// 获取本周日期范围
function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday.toISOString(),
    end: sunday.toISOString(),
  };
}

// GET /api/weekly-points?shareholder_id=1
// 获取股东本周积分使用状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareholderId = searchParams.get('shareholder_id');

    if (!shareholderId) {
      return NextResponse.json(
        { error: 'Missing shareholder_id' },
        { status: 400 }
      );
    }

    const year = getISOYear();
    const weekNumber = getISOWeek();
    const weekRange = getWeekRange();

    // 查询本周记录
    const { data: existingRecord, error: fetchError } = await supabase
      .from('weekly_points_usage')
      .select('*')
      .eq('shareholder_id', shareholderId)
      .eq('year', year)
      .eq('week_number', weekNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch weekly points error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch weekly points' },
        { status: 500 }
      );
    }

    // 如果记录不存在，创建新记录
    if (!existingRecord) {
      const { data: newRecord, error: insertError } = await supabase
        .from('weekly_points_usage')
        .insert([
          {
            shareholder_id: parseInt(shareholderId),
            year,
            week_number: weekNumber,
            used: false,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Create weekly points error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create weekly points record' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        shareholder_id: parseInt(shareholderId),
        year,
        week_number: weekNumber,
        used: false,
        week_range: weekRange,
      });
    }

    return NextResponse.json({
      shareholder_id: existingRecord.shareholder_id,
      year: existingRecord.year,
      week_number: existingRecord.week_number,
      used: existingRecord.used,
      used_at: existingRecord.used_at,
      week_range: weekRange,
    });
  } catch (error) {
    console.error('Weekly points GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/weekly-points/use
// 标记本周积分已使用（由 cashier 扫码核销时调用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareholder_id, redemption_id } = body;

    if (!shareholder_id || !redemption_id) {
      return NextResponse.json(
        { error: 'Missing shareholder_id or redemption_id' },
        { status: 400 }
      );
    }

    const year = getISOYear();
    const weekNumber = getISOWeek();

    // 先获取本周记录
    const { data: existingRecord, error: fetchError } = await supabase
      .from('weekly_points_usage')
      .select('*')
      .eq('shareholder_id', shareholder_id)
      .eq('year', year)
      .eq('week_number', weekNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch weekly points error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch weekly points' },
        { status: 500 }
      );
    }

    // 如果记录不存在，创建并标记为已使用
    if (!existingRecord) {
      const { data: newRecord, error: insertError } = await supabase
        .from('weekly_points_usage')
        .insert([
          {
            shareholder_id: parseInt(shareholder_id),
            year,
            week_number: weekNumber,
            used: true,
            used_at: new Date().toISOString(),
            redemption_id: parseInt(redemption_id),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Create weekly points error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create weekly points record' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Weekly points marked as used',
        shareholder_id: newRecord.shareholder_id,
        used: true,
      });
    }

    // 如果已使用，返回错误
    if (existingRecord.used) {
      return NextResponse.json(
        {
          success: false,
          error: 'Weekly points already used this week',
          used_at: existingRecord.used_at,
        },
        { status: 409 }
      );
    }

    // 标记为已使用
    const { data: updatedRecord, error: updateError } = await supabase
      .from('weekly_points_usage')
      .update({
        used: true,
        used_at: new Date().toISOString(),
        redemption_id: parseInt(redemption_id),
      })
      .eq('id', existingRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update weekly points error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update weekly points' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly points marked as used',
      shareholder_id: updatedRecord.shareholder_id,
      used: true,
      used_at: updatedRecord.used_at,
    });
  } catch (error) {
    console.error('Weekly points POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
