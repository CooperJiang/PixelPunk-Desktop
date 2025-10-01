use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowConfig {
    pub width: f64,
    pub height: f64,
    pub min_width: Option<f64>,
    pub min_height: Option<f64>,
    pub max_width: Option<f64>,
    pub max_height: Option<f64>,
    pub resizable: bool,
    pub maximizable: bool,
    pub minimizable: bool,
    pub closable: bool,
    pub always_on_top: bool,
    pub center: bool,
    pub skip_taskbar: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrayMenuItem {
    pub id: String,
    pub label: String,
    pub action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrayMenuGroup {
    pub label: String,
    pub items: Vec<TrayMenuItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrayConfig {
    pub enabled: bool,
    pub tooltip: Option<String>,
    pub title: Option<String>,
    pub menus: Vec<TrayMenuGroup>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevConfig {
    pub open_dev_tools: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FloatBallPanelConfig {
    pub width: f64,
    pub height: f64,
    pub expand_on_hover: bool,
    pub hover_delay: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FloatBallUploadConfig {
    pub api_url: String,
    pub max_file_size: u64,
    pub allowed_types: Vec<String>,
    pub concurrent: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FloatBallConfig {
    pub enabled: bool,
    pub width: f64,
    pub height: f64,
    pub default_x: f64,
    pub default_y: f64,
    pub always_on_top: bool,
    pub margin: f64,
    pub panel: FloatBallPanelConfig,
    pub upload: FloatBallUploadConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfigData {
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub homepage: Option<String>,
    pub repository: Option<String>,
    pub copyright: Option<String>,
    pub window: WindowConfig,
    pub tray: TrayConfig,
    pub float_ball: FloatBallConfig,
    pub dev: DevConfig,
}

// 默认配置
impl Default for AppConfigData {
    fn default() -> Self {
        Self {
            name: "Tauri Vue Template".to_string(),
            version: "1.0.0".to_string(),
            author: "Your Name".to_string(),
            description: "基于 Tauri + Vue 3 + TypeScript 的跨平台桌面应用开发模板".to_string(),
            homepage: Some("https://github.com".to_string()),
            repository: Some("https://github.com".to_string()),
            copyright: Some("Copyright © 2025 Your Name. All rights reserved.".to_string()),
            window: WindowConfig {
                width: 1200.0,
                height: 800.0,
                min_width: Some(800.0),
                min_height: Some(600.0),
                max_width: None,
                max_height: None,
                resizable: true,
                maximizable: true,
                minimizable: true,
                closable: true,
                always_on_top: false,
                center: true,
                skip_taskbar: false,
            },
            tray: TrayConfig {
                enabled: true,
                tooltip: Some("Tauri Vue Template".to_string()),
                title: Some("TVT".to_string()),
                menus: vec![
                    TrayMenuGroup {
                        label: "应用".to_string(),
                        items: vec![
                            TrayMenuItem {
                                id: "about".to_string(),
                                label: "关于".to_string(),
                                action: "about".to_string(),
                            },
                        ],
                    },
                    TrayMenuGroup {
                        label: "窗口".to_string(),
                        items: vec![
                            TrayMenuItem {
                                id: "show".to_string(),
                                label: "显示窗口".to_string(),
                                action: "show".to_string(),
                            },
                            TrayMenuItem {
                                id: "quit".to_string(),
                                label: "退出".to_string(),
                                action: "quit".to_string(),
                            },
                        ],
                    },
                ],
            },
            float_ball: FloatBallConfig {
                enabled: true,
                width: 60.0,
                height: 60.0,
                default_x: 0.0,
                default_y: 0.0,
                always_on_top: true,
                margin: 80.0,
                panel: FloatBallPanelConfig {
                    width: 320.0,
                    height: 450.0,
                    expand_on_hover: true,
                    hover_delay: 300,
                },
                upload: FloatBallUploadConfig {
                    api_url: "/api/upload".to_string(),
                    max_file_size: 104857600, // 100MB
                    allowed_types: vec![],
                    concurrent: 3,
                },
            },
            dev: DevConfig {
                open_dev_tools: false,
            },
        }
    }
}

impl AppConfigData {
    pub fn load() -> Self {
        // 从编译时嵌入的 JSON 文件加载配置
        let config_str = include_str!("../app.config.json");
        serde_json::from_str(config_str).unwrap_or_else(|_| Self::default())
    }
}

#[tauri::command]
pub fn get_app_config() -> AppConfigData {
    AppConfigData::load()
}