use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub fn toggle_float_ball(app: AppHandle, show: bool) -> Result<(), String> {
    log::info!("Toggle float ball: {}", show);

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
    log::info!("Close float ball window");

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

    // 计算悬浮球位置（屏幕中间，方便看到）
    let (x, y) = if float_config.default_x == 0.0 && float_config.default_y == 0.0 {
        let monitor = app.primary_monitor().ok().flatten();
        if let Some(monitor) = monitor {
            let size = monitor.size();
            let scale = monitor.scale_factor();
            // 转换为逻辑坐标（物理坐标 / scale factor）
            let screen_width = size.width as f64 / scale;
            let screen_height = size.height as f64 / scale;
            let x = (screen_width - float_config.width) / 2.0;
            let y = (screen_height - float_config.height) / 2.0;
            log::info!("Monitor: {}x{} (physical), scale: {}, logical: {}x{}, position: ({}, {})",
                size.width, size.height, scale, screen_width, screen_height, x, y);
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

    log::info!("Float ball window created at position ({}, {})", x, y);
    Ok(())
}
