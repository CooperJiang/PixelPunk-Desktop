/**
 * 自动更新器配置
 *
 * 使用说明：
 * 1. 修改 endpoints 为你的更新服务器地址
 * 2. 生成密钥对：npm run tauri signer generate -- -w ~/.tauri/myapp.key
 * 3. 将公钥配置到 tauri.conf.json 的 plugins.updater.pubkey
 * 4. 使用私钥签名发布包
 */

export interface UpdaterConfig {
  enabled: boolean; // 是否启用自动更新
  checkOnStartup: boolean; // 启动时检查更新
  checkInterval: number; // 定时检查间隔（毫秒，0表示不定时检查）
  silent: boolean; // 静默更新还是提示用户
  endpoints: string[]; // 更新服务器地址
}

export const updaterConfig: UpdaterConfig = {
  enabled: false, // 默认关闭，开发者需要配置后启用
  checkOnStartup: true,
  checkInterval: 3600000, // 1小时检查一次
  silent: false,
  endpoints: [
    // 开发者需要替换为自己的更新服务器
    // 支持的变量: {{target}}, {{arch}}, {{current_version}}
    "https://your-update-server.com/{{target}}/{{current_version}}",
  ],
};
