import { onBeforeUnmount, onMounted, ref } from "vue";

interface Options {
  containerSelector?: string;
  gridSelector?: string;
  childSelector?: string;
  itemMinWidth?: number; // 单卡片的最小宽度（含gap）
  columnGap?: number; // 列间距，用于更精确计算
  rowMultiple?: number; // 行数基数（例如默认取3行填满）
  debounceMs?: number;
  defaultSize?: number;
  debug?: boolean;
  preferCssColumns?: boolean; // 优先使用 CSS 列定义推断列数（默认开启）
  minDeltaPx?: number; // 触发重算的最小宽度变化阈值，避免频繁抖动
  mode?: "once" | "observe";
}

export function useResponsivePageSize(options: Options = {}) {
  const {
    containerSelector = ".files-grid",
    gridSelector = containerSelector,
    childSelector = undefined,
    itemMinWidth = 200,
    columnGap = 16,
    rowMultiple = 4,
    debounceMs = 120,
    defaultSize = 24,
    debug: _debug = false,
    preferCssColumns = true,
    minDeltaPx = 8,
    mode = "observe",
  } = options;

  const pageSize = ref<number>(defaultSize);
  const columns = ref<number>(1);
  const containerWidth = ref<number>(0);

  let resizeObserver: ResizeObserver | null = null;
  let debounceTimer: number | null = null;
  let lastWidth = 0;
  let stopped = false;

  const parsePx = (val: string | null | undefined): number => {
    if (!val) {
      return 0;
    }
    const n = parseFloat(val.toString());
    return isNaN(n) ? 0 : n;
  };

  const cleanup = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener("resize", handleResize);
    stopped = true;
  };

  const calc = () => {
    if (stopped) {
      return;
    }
    const container = document.querySelector(
      containerSelector,
    ) as HTMLElement | null;
    const grid = document.querySelector(gridSelector) as HTMLElement | null;

    if (!container) {
      return;
    }

    const width = container.clientWidth;
    if (Math.abs(width - lastWidth) < minDeltaPx) {
      return;
    }
    lastWidth = width;
    containerWidth.value = width;

    /* 从 grid 计算样式推断列数 */
    let colsFromCss: number | null = null;
    let gapFromCss = columnGap;
    let colsFromChild: number | null = null;

    if (grid) {
      const style = window.getComputedStyle(grid);
      const gridTemplateColumns =
        style.getPropertyValue("grid-template-columns") || "";
      const colDefs = gridTemplateColumns.trim().split(/\s+/).filter(Boolean);
      if (colDefs.length > 0 && gridTemplateColumns !== "none") {
        colsFromCss = colDefs.length;
      }
      const cssGap = parsePx(style.getPropertyValue("column-gap"));
      gapFromCss = cssGap > 0 ? cssGap : columnGap;

      /* 可选：通过子项宽度推断（默认关闭以减少布局测量开销） */
      if (!preferCssColumns) {
        let childEl: HTMLElement | null = null;
        if (childSelector) {
          childEl = grid.querySelector(childSelector) as HTMLElement | null;
        } else {
          childEl = grid.firstElementChild as HTMLElement | null;
        }
        const childWidth = childEl?.getBoundingClientRect().width || 0;
        if (childWidth > 0) {
          colsFromChild = Math.max(
            1,
            Math.round((width + gapFromCss) / (childWidth + gapFromCss)),
          );
        }
      }
    }

    /* 兜底：用最小宽度估算 */
    const effectiveItem = itemMinWidth + gapFromCss;
    const colsFromMin = Math.max(
      1,
      Math.floor((width + gapFromCss) / effectiveItem),
    );

    /* 选择优先级：CSS →（可选）子项 → 最小宽度估算 */
    const finalCols = colsFromCss || colsFromChild || colsFromMin;
    columns.value = finalCols;

    /* 动态页大小：列数 * 行数基数 */
    pageSize.value = finalCols * rowMultiple;

    console.log(
      `📐 计算分页大小: 容器宽度=${width}px, CSS列数=${colsFromCss}, 计算列数=${colsFromMin}, 最终列数=${finalCols}, pageSize=${pageSize.value}`,
    );

    if (mode === "once") {
      cleanup();
    }
  };

  const handleResize = () => {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(calc, debounceMs);
  };

  onMounted(() => {
    /* 初始计算 */
    setTimeout(calc, 0);

    /* 监听容器变化 */
    if (mode === "observe") {
      const container = document.querySelector(containerSelector);
      if (container && "ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(container as Element);
      }
      window.addEventListener("resize", handleResize, { passive: true });
    }
  });

  onBeforeUnmount(() => cleanup());

  return { pageSize, columns, containerWidth, recalc: calc, stop: cleanup };
}
