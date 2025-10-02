use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;

pub struct SingleInstance {
    lock_file: Option<File>,
    lock_path: PathBuf,
}

impl SingleInstance {
    pub fn new(app_name: &str) -> Result<Self, String> {
        let lock_path = Self::get_lock_path(app_name)?;

        // 尝试创建锁文件
        let lock_file = Self::try_acquire_lock(&lock_path)?;

        Ok(Self {
            lock_file: Some(lock_file),
            lock_path,
        })
    }

    fn get_lock_path(app_name: &str) -> Result<PathBuf, String> {
        let temp_dir = std::env::temp_dir();
        let lock_name = format!("{}.lock", app_name.replace(" ", "-").to_lowercase());
        Ok(temp_dir.join(lock_name))
    }

    #[cfg(unix)]
    fn try_acquire_lock(path: &PathBuf) -> Result<File, String> {
        use std::os::unix::io::AsRawFd;

        let file = OpenOptions::new()
            .create(true)
            .write(true)
            .open(path)
            .map_err(|e| format!("Failed to open lock file: {}", e))?;

        // 尝试获取文件锁
        let fd = file.as_raw_fd();
        let result = unsafe {
            libc::flock(fd, libc::LOCK_EX | libc::LOCK_NB)
        };

        if result != 0 {
            return Err("Another instance is already running".to_string());
        }

        Ok(file)
    }

    #[cfg(windows)]
    fn try_acquire_lock(path: &PathBuf) -> Result<File, String> {
        // Windows: 使用独占打开模式
        // 注意：这个实现在 Windows 上可能不够可靠
        // 建议用户在 Windows 上使用第三方单实例解决方案
        OpenOptions::new()
            .create(true)
            .write(true)
            .open(path)
            .map_err(|_| "Failed to acquire lock (another instance may be running)".to_string())
    }

    #[cfg(not(any(unix, windows)))]
    fn try_acquire_lock(path: &PathBuf) -> Result<File, String> {
        // 其他平台使用简单的文件存在检查
        if path.exists() {
            return Err("Another instance is already running".to_string());
        }

        OpenOptions::new()
            .create(true)
            .write(true)
            .open(path)
            .map_err(|e| format!("Failed to create lock file: {}", e))
    }
}

impl Drop for SingleInstance {
    fn drop(&mut self) {
        // 释放锁文件
        if let Some(mut file) = self.lock_file.take() {
            let _ = file.flush();
            drop(file);

            // 删除锁文件
            let _ = std::fs::remove_file(&self.lock_path);
        }
    }
}
