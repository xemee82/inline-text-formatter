const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const zipFileName = `inline-text-formatter-v${manifest.version}.zip`;
const zipPath = path.join(rootDir, zipFileName);
const icloudDir = '/Users/tylerh/Library/Mobile Documents/com~apple~CloudDocs/Formatly_Store_Assets';
const icloudRepoDir = '/Users/tylerh/Library/Mobile Documents/com~apple~CloudDocs/linkedin-text-formatter';

// 先删除可能已存在的旧 zip
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// 目标包含项清单（白名单复制模式，确保 100% 纯净）
const stagingDir = path.join(rootDir, 'build-staging');
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// 复制 manifest.json
fs.copyFileSync(path.join(rootDir, 'manifest.json'), path.join(stagingDir, 'manifest.json'));

// 复制 LICENSE
fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(stagingDir, 'LICENSE'));

// 复制 content/ (排除测试文件)
fs.mkdirSync(path.join(stagingDir, 'content'), { recursive: true });
const contentFiles = fs.readdirSync(path.join(rootDir, 'content'));
for (const file of contentFiles) {
  if (file.endsWith('.test.js')) continue;
  fs.copyFileSync(path.join(rootDir, 'content', file), path.join(stagingDir, 'content', file));
}

// 复制 popup/
fs.mkdirSync(path.join(stagingDir, 'popup'), { recursive: true });
const popupFiles = fs.readdirSync(path.join(rootDir, 'popup'));
for (const file of popupFiles) {
  fs.copyFileSync(path.join(rootDir, 'popup', file), path.join(stagingDir, 'popup', file));
}

// 复制 icons/ (仅必须尺寸，排除 concepts 和 svg)
fs.mkdirSync(path.join(stagingDir, 'icons'), { recursive: true });
const requiredIcons = ['icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png'];
for (const icon of requiredIcons) {
  const src = path.join(rootDir, 'icons', icon);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(stagingDir, 'icons', icon));
  }
}

// 执行 zip 压缩（从 stagingDir 根目录打包）
const cmd = `cd "${stagingDir}" && zip -r -9 "${zipPath}" . -x "*.DS_Store"`;
execSync(cmd, { stdio: 'inherit' });

// 清理 staging 目录
fs.rmSync(stagingDir, { recursive: true, force: true });

// 同步备份至 iCloud 目录
if (fs.existsSync(icloudDir)) {
  fs.copyFileSync(zipPath, path.join(icloudDir, zipFileName));
  console.log(`☁️ Synced to iCloud: ${path.join(icloudDir, zipFileName)}`);
}
if (fs.existsSync(icloudRepoDir)) {
  fs.copyFileSync(zipPath, path.join(icloudRepoDir, zipFileName));
  console.log(`☁️ Synced to iCloud Repo: ${path.join(icloudRepoDir, zipFileName)}`);
}

// 闭环自检：列出 zip 包内容
console.log('\n==========================================');
console.log(`📦 Package Created: ${zipFileName}`);
const stats = fs.statSync(zipPath);
console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
console.log('==========================================');
console.log('ZIP Contents Verification:');
const listOutput = execSync(`unzip -l "${zipPath}"`).toString();
console.log(listOutput);
console.log('✓ Release ZIP verification complete.');
