const { existsSync, readdirSync } = require('fs');
const { join } = require('path');

/**
 * 定位依赖树中带 CJS 入口的 uuid。
 *
 * uuid@13 起为纯 ESM（package.json exports 只有 import 条件，没有 require），
 * jest 以 CommonJS 加载时会抛 "Must use import to load ES Module"，
 * 导致应用在测试环境无法启动。依赖树中通常并存 uuid@11（提供 dist/cjs 入口），
 * 这里在 pnpm 虚拟存储目录里按版本降序找第一个带 CJS 入口的版本。
 *
 * 仅作用于测试环境，不改变生产依赖树。
 *
 * @returns {string|null} uuid CJS 入口绝对路径；找不到时返回 null
 */
function resolveUuidCjsEntry() {
    const pnpmDir = join(__dirname, 'node_modules', '.pnpm');
    if (!existsSync(pnpmDir)) return null;
    const versionOf = (dir) => {
        const raw = dir.slice('uuid@'.length).split('_')[0];
        return Number(raw.split('.')[0]) || 0;
    };
    const candidates = readdirSync(pnpmDir)
        .filter((d) => d.startsWith('uuid@'))
        .sort((a, b) => versionOf(b) - versionOf(a));
    for (const dir of candidates) {
        const cjs = join(pnpmDir, dir, 'node_modules', 'uuid', 'dist', 'cjs', 'index.js');
        if (existsSync(cjs)) return cjs;
    }
    return null;
}

const uuidCjs = resolveUuidCjsEntry();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  ...(uuidCjs
    ? {
      moduleNameMapper: {
        '^uuid$': uuidCjs,
      },
    }
    : {}),
};
