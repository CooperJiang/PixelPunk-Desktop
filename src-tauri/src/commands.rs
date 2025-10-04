use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

/// 显示并聚焦主窗口
#[tauri::command]
pub fn show_main_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        window.unminimize().map_err(|e| e.to_string())?;

        // 开发模式下打开 DevTools
        #[cfg(debug_assertions)]
        {
            use crate::config::AppConfigData;
            let config = AppConfigData::load();
            if config.dev.open_dev_tools {
                window.open_devtools();
                log::info!("DevTools opened for main window");
            }
        }

        // 如果登录窗口存在，则隐藏
        if let Some(login) = app.get_webview_window("login") {
            let _ = login.hide();
        }
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}

/// 显示并聚焦登录窗口，同时隐藏主窗口（如存在）
#[tauri::command]
pub fn show_login_window(app: AppHandle) -> Result<(), String> {
    if let Some(login) = app.get_webview_window("login") {
        login.show().map_err(|e| e.to_string())?;
        login.set_focus().map_err(|e| e.to_string())?;

        if let Some(main) = app.get_webview_window("main") {
            let _ = main.hide();
        }
        Ok(())
    } else {
        // 如果登录窗口不存在，则创建一个
        let login_url = if cfg!(debug_assertions) {
            "http://localhost:5173/#/login"
        } else {
            "index.html#/login"
        };

        let login = WebviewWindowBuilder::new(&app, "login", WebviewUrl::App(login_url.into()))
            .title("PixelPunk - 登录")
            .inner_size(900.0, 600.0)
            .resizable(false)
            .maximizable(false)
            .minimizable(true)
            .decorations(false)
            .center()
            .build()
            .map_err(|e| e.to_string())?;

        login.show().map_err(|e| e.to_string())?;
        login.set_focus().map_err(|e| e.to_string())?;

        if let Some(main) = app.get_webview_window("main") {
            let _ = main.hide();
        }
        Ok(())
    }
}

#[tauri::command]
pub fn toggle_float_ball(app: AppHandle, show: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("float-ball") {
        if show {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        } else {
            window.hide().map_err(|e| e.to_string())?;
        }
        Ok(())
    } else if show {
        // 如果窗口不存在且需要显示，则创建窗口
        create_float_ball_window(app)
    } else {
        Ok(())
    }
}

#[tauri::command]
pub fn close_float_ball(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("float-ball") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn is_float_ball_visible(app: AppHandle) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("float-ball") {
        window.is_visible().map_err(|e| e.to_string())
    } else {
        Ok(false)
    }
}

fn create_float_ball_window(app: AppHandle) -> Result<(), String> {
    use crate::config::AppConfigData;

    let config = AppConfigData::load();
    let float_config = &config.float_ball;

    // 计算悬浮球位置（右下角）
    let (x, y) = if float_config.default_x == 0.0 && float_config.default_y == 0.0 {
        let monitor = app.primary_monitor().ok().flatten();
        if let Some(monitor) = monitor {
            let size = monitor.size();
            let scale = monitor.scale_factor();
            // 转换为逻辑坐标（物理坐标 / scale factor）
            let screen_width = size.width as f64 / scale;
            let screen_height = size.height as f64 / scale;
            let x = screen_width - float_config.width - float_config.margin;
            let y = screen_height - float_config.height - float_config.margin;
            (x, y)
        } else {
            (100.0, 100.0)
        }
    } else {
        (float_config.default_x, float_config.default_y)
    };

    let float_url = if cfg!(debug_assertions) {
        "http://localhost:5173/#/float-ball"
    } else {
        "index.html#/float-ball"
    };

    let window = WebviewWindowBuilder::new(&app, "float-ball", WebviewUrl::App(float_url.into()))
        .title("Float Ball")
        .inner_size(float_config.width, float_config.height)
        .position(x, y)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .decorations(false)
        .always_on_top(float_config.always_on_top)
        .skip_taskbar(true)
        .build()
        .map_err(|e| e.to_string())?;

    // 设置窗口透明（需在创建后立刻设置）
    crate::macos::set_window_transparent(&window);

    window.show().map_err(|e| e.to_string())?;

    log::info!("Float ball window created");
    Ok(())
}
