use tauri::Manager;
use tauri::menu::{Menu, MenuItem, Submenu};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri::image::Image;
use tauri::{WebviewUrl, WebviewWindowBuilder};
use image::GenericImageView;

mod config;
use config::AppConfigData;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_os::init())
    .invoke_handler(tauri::generate_handler![config::get_app_config])
    .setup(|app| {
      // 先初始化日志
      app.handle().plugin(
        tauri_plugin_log::Builder::default()
          .level(log::LevelFilter::Info)
          .build(),
      )?;

      log::info!("Application setup starting...");

      // 加载配置
      let config = AppConfigData::load();
      log::info!("Config loaded: {}", config.name);

      // 应用窗口配置
      if let Some(window) = app.get_webview_window("main") {
        let window_config = &config.window;

        // 应用窗口尺寸限制
        if let (Some(min_w), Some(min_h)) = (window_config.min_width, window_config.min_height) {
          let _ = window.set_min_size(Some(tauri::LogicalSize::new(min_w, min_h)));
        }
        if let (Some(max_w), Some(max_h)) = (window_config.max_width, window_config.max_height) {
          let _ = window.set_max_size(Some(tauri::LogicalSize::new(max_w, max_h)));
        }

        // 应用窗口行为
        let _ = window.set_resizable(window_config.resizable);
        let _ = window.set_maximizable(window_config.maximizable);
        let _ = window.set_minimizable(window_config.minimizable);
        let _ = window.set_closable(window_config.closable);
        let _ = window.set_always_on_top(window_config.always_on_top);
        let _ = window.set_skip_taskbar(window_config.skip_taskbar);

        if window_config.center {
          let _ = window.center();
        }

        log::info!("Window config applied");
      }

      // 开发模式打开 DevTools
      if cfg!(debug_assertions) && config.dev.open_dev_tools {
        if let Some(window) = app.get_webview_window("main") {
          window.open_devtools();
        }
      }

      // 创建托盘（如果启用）
      if config.tray.enabled {
        log::info!("Starting tray icon setup...");

        // 存储所有菜单项，防止被销毁
        let mut all_items: Vec<MenuItem<tauri::Wry>> = Vec::new();
        let mut submenus: Vec<Submenu<tauri::Wry>> = Vec::new();

        for group in &config.tray.menus {
          let start_idx = all_items.len();

          // 为每个分组创建菜单项
          for item in &group.items {
            let menu_item = MenuItem::with_id(app, &item.id, &item.label, true, None::<&str>)?;
            all_items.push(menu_item);
          }

          // 获取当前分组的菜单项引用
          let items_refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> =
            all_items[start_idx..].iter().map(|item| item as &dyn tauri::menu::IsMenuItem<tauri::Wry>).collect();

          let submenu = Submenu::with_items(app, &group.label, true, &items_refs)?;
          submenus.push(submenu);
        }

        // 创建主菜单，包含所有子菜单
        let submenu_refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> =
          submenus.iter().map(|submenu| submenu as &dyn tauri::menu::IsMenuItem<tauri::Wry>).collect();
        let menu = Menu::with_items(app, &submenu_refs)?;
        log::info!("Menu created with {} groups", config.tray.menus.len());

        // 创建系统托盘
        log::info!("Creating system tray...");

        // 加载并转换图标
        let icon_bytes = include_bytes!("../icons/32x32.png");
        let img = image::load_from_memory(icon_bytes).expect("Failed to load icon");
        let (width, height) = img.dimensions();
        let rgba = img.to_rgba8().into_raw();
        let icon_image = Image::new_owned(rgba, width, height);
        log::info!("Icon loaded successfully: {}x{}", width, height);

        // 使用配置中的 tooltip 和 title
        let tooltip = config.tray.tooltip.as_deref().unwrap_or(&config.name);
        let title = config.tray.title.as_deref().unwrap_or("");

        let tray_result = TrayIconBuilder::with_id("main-tray")
          .icon(icon_image)
          .icon_as_template(true) // macOS 模板图标
          .tooltip(tooltip)
          .title(title)
          .menu(&menu)
          .show_menu_on_left_click(true) // 左键点击显示菜单
          .on_menu_event(|app, event| {
            log::info!("Menu event triggered: {:?}", event.id);
            match event.id.as_ref() {
              "about" => {
                log::info!("About menu clicked");
                // 检查关于窗口是否已存在
                if let Some(about_window) = app.get_webview_window("about") {
                  let _ = about_window.show();
                  let _ = about_window.set_focus();
                } else {
                  // 创建新的关于窗口
                  let about_url = if cfg!(debug_assertions) {
                    "http://localhost:5173/about.html"
                  } else {
                    "about.html"
                  };

                  let _ = WebviewWindowBuilder::new(app, "about", WebviewUrl::App(about_url.into()))
                    .title("关于")
                    .inner_size(480.0, 520.0)
                    .resizable(false)
                    .center()
                    .decorations(true)
                    .build();
                }
              }
              "settings" => {
                log::info!("Settings menu clicked");
                // 设置功能待实现
              }
              "show" => {
                log::info!("Show menu clicked");
                // 显示并聚焦窗口
                if let Some(window) = app.get_webview_window("main") {
                  let _ = window.show();
                  let _ = window.set_focus();
                }
              }
              "quit" => {
                log::info!("Quit menu clicked");
                app.exit(0);
              }
              _ => {
                log::warn!("Unknown menu event: {:?}", event.id);
              }
            }
          })
          .on_tray_icon_event(|tray, event| {
            log::info!("Tray icon event: {:?}", event);
            match event {
              TrayIconEvent::Click { button, .. } => {
                log::info!("Tray clicked with button: {:?}", button);
                if let Some(window) = tray.app_handle().get_webview_window("main") {
                  let _ = window.show();
                  let _ = window.set_focus();
                }
              }
              _ => {}
            }
          })
          .build(app);

        match tray_result {
          Ok(_) => log::info!("System tray created successfully!"),
          Err(e) => log::error!("Failed to create system tray: {:?}", e),
        }
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
