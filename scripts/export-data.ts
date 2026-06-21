/**
 * SFD6 Shareholder App - 数据导出脚本
 * 用于从 Supabase 导出所有表数据
 * 
 * 使用方法:
 * npx ts-node scripts/export-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffgfzvnoyyvfmhuorzcw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ 错误: 请设置 SUPABASE_SERVICE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// 导出目录
const EXPORT_DIR = path.join(__dirname, '../data-exports');

// 确保导出目录存在
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// 获取当前时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

interface ExportResult {
  table: string;
  count: number;
  file: string;
  success: boolean;
  error?: string;
}

/**
 * 导出单个表的数据
 */
async function exportTable(tableName: string): Promise<ExportResult> {
  console.log(`📊 正在导出表: ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    const count = data?.length || 0;
    const fileName = `${tableName}_${timestamp}.json`;
    const filePath = path.join(EXPORT_DIR, fileName);

    // 保存为 JSON
    fs.writeFileSync(
      filePath,
      JSON.stringify({
        table: tableName,
        exported_at: new Date().toISOString(),
        count,
        data: data || []
      }, null, 2)
    );

    // 同时保存为 CSV
    if (data && data.length > 0) {
      const csvFileName = `${tableName}_${timestamp}.csv`;
      const csvPath = path.join(EXPORT_DIR, csvFileName);
      const csv = convertToCSV(data);
      fs.writeFileSync(csvPath, csv);
    }

    console.log(`  ✅ 成功导出 ${count} 条记录`);
    
    return {
      table: tableName,
      count,
      file: fileName,
      success: true
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ 导出失败: ${errorMsg}`);
    
    return {
      table: tableName,
      count: 0,
      file: '',
      success: false,
      error: errorMsg
    };
  }
}

/**
 * 将数据转换为 CSV 格式
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // 处理包含逗号或换行符的值
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * 导出所有数据
 */
async function exportAllData() {
  console.log('🚀 SFD6 Shareholder App - 数据导出工具\n');
  console.log(`📁 导出目录: ${EXPORT_DIR}`);
  console.log(`⏰ 时间戳: ${timestamp}\n`);

  const tables = [
    'shareholders',
    'weekly_points_usage',
    'redemptions',
    'family_cards',
    'cashiers'
  ];

  const results: ExportResult[] = [];

  for (const table of tables) {
    const result = await exportTable(table);
    results.push(result);
    console.log('');
  }

  // 生成汇总报告
  const summary = {
    exported_at: new Date().toISOString(),
    total_tables: tables.length,
    successful_exports: results.filter(r => r.success).length,
    failed_exports: results.filter(r => !r.success).length,
    results
  };

  const summaryFile = path.join(EXPORT_DIR, `export-summary_${timestamp}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  // 打印汇总
  console.log('\n📋 导出汇总');
  console.log('===================');
  console.log(`总表数: ${tables.length}`);
  console.log(`成功: ${summary.successful_exports}`);
  console.log(`失败: ${summary.failed_exports}`);
  console.log(`\n汇总报告: ${summaryFile}`);

  // 打印每个表的结果
  console.log('\n📊 详细结果:');
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} ${r.table}: ${r.count} 条记录`);
  });
}

// 运行导出
exportAllData().catch(console.error);
