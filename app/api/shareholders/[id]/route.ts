import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// DELETE /api/shareholders/[id]
// 删除股东
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid shareholder ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('shareholders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete shareholder error:', error);
      return NextResponse.json(
        { error: 'Failed to delete shareholder' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete shareholder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
