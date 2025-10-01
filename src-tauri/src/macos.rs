#[allow(unexpected_cfgs)]
#[cfg(target_os = "macos")]
pub fn set_window_transparent(window: &tauri::WebviewWindow) {
    use cocoa::base::{id, NO};
    use objc::{class, msg_send, sel, sel_impl};

    unsafe {
        if let Ok(raw) = window.ns_window() {
            let ns_window = raw as id;

            // 窗口透明与背景清除
            let _: () = msg_send![ns_window, setOpaque: NO];
            let clear_color: id = msg_send![class!(NSColor), clearColor];
            let _: () = msg_send![ns_window, setBackgroundColor: clear_color];

            // 去掉系统阴影，使用 CSS 阴影效果
            let _: () = msg_send![ns_window, setHasShadow: NO];

            // 3 对应 NSFloatingWindowLevel 附近，保持置顶
            let _: () = msg_send![ns_window, setLevel: 3_i64];

            // 让 WKWebView 背景透明
            let content_view: id = msg_send![ns_window, contentView];
            let subviews: id = msg_send![content_view, subviews];
            let count: usize = msg_send![subviews, count];
            if count > 0 {
                let webview: id = msg_send![subviews, objectAtIndex: 0];
                let no_number: id = msg_send![class!(NSNumber), numberWithBool: NO];
                let key = ns_string("drawsBackground");
                let _: () = msg_send![webview, setValue: no_number forKey: key];
            }

            log::info!("macOS window set to transparent");
        }
    }
}

#[allow(unexpected_cfgs)]
#[cfg(target_os = "macos")]
unsafe fn ns_string(s: &str) -> cocoa::base::id {
    use cocoa::base::id;
    use objc::{class, msg_send, sel, sel_impl};
    use std::ffi::CString;

    let cstr = CString::new(s).unwrap();
    let ns_string: id = msg_send![class!(NSString), alloc];
    let ns_string: id = msg_send![ns_string, initWithUTF8String: cstr.as_ptr()];
    ns_string
}

#[cfg(not(target_os = "macos"))]
pub fn set_window_transparent(_window: &tauri::WebviewWindow) {
    // 其他平台留空；透明由 CSS/默认背景控制
}
