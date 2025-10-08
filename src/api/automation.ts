/**
 * 用户自动任务 API
 * 用于查询当前用户的 AI 打标和向量化任务状态
 */
import { get } from "@/utils/network/http";
import type { ApiResult } from "@/utils/network/http-types";

/**
 * 打标任务统计信息
 */
export interface TaggingTaskStats {
  /** 未处理 */
  none_count: number;
  /** 队列中 */
  pending_count: number;
  /** 处理中 */
  processing_count: number;
  /** 已完成 */
  done_count: number;
  /** 失败 */
  failed_count: number;
  /** 已忽略 */
  ignored_count: number;
  /** 总数 */
  total_count: number;
  /** 队列位置（如果有排队） */
  queue_position?: number;
}

/**
 * 向量化任务统计信息
 */
export interface VectorTaskStats {
  /** 待处理 */
  pending_count: number;
  /** 处理中 */
  processing_count: number;
  /** 已完成 */
  completed_count: number;
  /** 失败 */
  failed_count: number;
  /** 重置 */
  reset_count: number;
  /** 总数 */
  total_count: number;
  /** 队列位置（如果有排队） */
  queue_position?: number;
}

/**
 * 自动任务总览信息
 */
export interface AutomationOverview {
  /** 打标任务统计 */
  tagging: TaggingTaskStats;
  /** 向量化任务统计 */
  vector: VectorTaskStats;
  /** 系统队列状态 */
  system_status: {
    /** 打标队列是否启用 */
    tagging_enabled: boolean;
    /** 向量队列是否启用 */
    vector_enabled: boolean;
    /** 打标并发数 */
    tagging_concurrency: number;
    /** 向量并发数 */
    vector_concurrency: number;
    /** 当前总队列长度 */
    total_queue_length: number;
  };
}

/**
 * 打标任务详情项
 */
export interface TaggingTaskItem {
  id: string;
  file_id: string;
  file_name: string;
  thumbnail_url?: string;
  status: "none" | "pending" | "processing" | "done" | "failed" | "ignored";
  tries: number;
  error_message?: string;
  updated_at: string;
  created_at: string;
}

/**
 * 向量任务详情项
 */
export interface VectorTaskItem {
  id: number;
  file_id: string;
  file_name: string;
  thumbnail_url?: string;
  status: "pending" | "processing" | "completed" | "failed" | "reset";
  model: string;
  retry_count: number;
  error_message?: string;
  updated_at: string;
  created_at: string;
}

/**
 * 任务列表查询参数
 */
export interface TaskListParams {
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * 任务列表响应
 */
export interface TaskListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 获取用户自动任务总览
 */
export function getUserAutomationOverview(): Promise<
  ApiResult<AutomationOverview>
> {
  return get<AutomationOverview>("/user/automation/overview");
}

/**
 * 获取用户打标任务列表
 */
export function getUserTaggingTasks(
  params?: TaskListParams,
): Promise<ApiResult<TaskListResponse<TaggingTaskItem>>> {
  return get<TaskListResponse<TaggingTaskItem>>(
    "/user/automation/tagging/tasks",
    params,
  );
}

/**
 * 获取用户向量任务列表
 */
export function getUserVectorTasks(
  params?: TaskListParams,
): Promise<ApiResult<TaskListResponse<VectorTaskItem>>> {
  return get<TaskListResponse<VectorTaskItem>>(
    "/user/automation/vector/tasks",
    params,
  );
}

export default {
  getUserAutomationOverview,
  getUserTaggingTasks,
  getUserVectorTasks,
};
