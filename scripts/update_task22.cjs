'use strict';
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 从 .env 解析连接配置（避免硬编码）
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
}

const cfg = {
  host: env.DB_HOST || 'server.fefeding.cn',
  port: Number(env.DB_PORT || 3306),
  user: env.DB_USERNAME || 'fefeding',
  password: env.DB_PASSWORD || '',
  database: env.DB_DATABASE || 'db_crontask',
};

const NEW_SCRIPT = `const apiUrl = 'https://api.aigcwhere.com/rss';
const client = modules.axios.create({ timeout: 30000 });

for (const type of ['all', 'news']) {
    const url = apiUrl + '/' + type;
    try {
        const res = await client.get(url, {
            headers: { 'Content-Type': 'text/plain' },
            responseType: 'text',
        });
        const data = res.data || '';
        console.log('[' + type + '] OK status=' + res.status + ' bytes=' + data.length);
    } catch (e) {
        console.error('[' + type + '] 请求失败:', e.message);
        throw e;
    }
}
`;

(async () => {
  const conn = await mysql.createConnection(cfg);
  try {
    const [rows] = await conn.execute(
      'SELECT Fid, Fname, Fscript FROM t_task_config WHERE Fid = ?',
      [22]
    );
    if (!rows || rows.length === 0) {
      console.error('未找到任务 22');
      process.exit(1);
    }
    const cur = rows[0];
    console.log('当前任务:', cur.Fid, cur.Fname);
    console.log('当前脚本前 120 字符:\n', String(cur.Fscript).slice(0, 120));

    const [upd] = await conn.execute(
      'UPDATE t_task_config SET Fscript = ? WHERE Fid = ?',
      [NEW_SCRIPT, 22]
    );
    console.log('更新影响行数:', upd.affectedRows);

    const [after] = await conn.execute(
      'SELECT Fscript FROM t_task_config WHERE Fid = ?',
      [22]
    );
    console.log('更新后脚本:\n' + after[0].Fscript);
    console.log('OK');
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error('执行失败:', e.message);
  process.exit(1);
});
