// 标签类型
export interface FileTag {
  id: string;
  name: string;
}

// AI信息类型
export interface AIInfo {
  description?: string;
  tags?: string[];
  dominant_color?: string;
  resolution?: string;
  is_nsfw?: boolean;
  nsfw_score?: number;
  nsfw_evaluation?: string;
}

// 文件信息类型
export interface FileInfo {
  id: string;
  name?: string;
  original_name: string;
  display_name?: string;
  size: number;
  size_formatted?: string;
  mime_type?: string;
  format: string;
  extension?: string;
  url: string;
  full_url: string;
  short_url?: string;
  thumb_url?: string;
  full_thumb_url?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  resolution?: string;
  access_level: "public" | "private" | "protected";
  folder_id?: string;
  created_at: string;
  updated_at: string;
  tags?: FileTag[];
  ai_info?: AIInfo;
  description?: string; // AI描述的快捷访问
}

// 文件夹信息类型
export interface FolderInfo {
  id: string;
  name: string;
  parent_id?: string;
  fullPath?: string;
  path?: string;
  children?: FolderInfo[];
  has_children?: boolean;
  permission?: "public" | "private";
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// 上传选项
export interface UploadOptions {
  folder_id?: string;
  access_level?: "public" | "private" | "protected";
  optimize?: boolean;
  storage_duration?: string;
}

// 上传进度事件
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  lengthComputable: boolean;
}
