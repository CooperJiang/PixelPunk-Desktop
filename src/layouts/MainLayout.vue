<script setup lang="ts">
import { ref, computed } from "vue";
import IconSidebar from "./IconSidebar.vue";
import SubMenu from "./SubMenu.vue";

// 当前选中的主菜单
const activeMainMenu = ref("dashboard");

// 没有二级菜单的主菜单列表
const menusWithoutSubMenu = ["dashboard"];

// 是否显示二级菜单
const showSubMenu = computed(() => {
  return !menusWithoutSubMenu.includes(activeMainMenu.value);
});

const handleMenuChange = (menuId: string) => {
  activeMainMenu.value = menuId;
};
</script>

<template>
  <div class="flex h-full w-full">
    <!-- 左侧：图标侧边栏 -->
    <IconSidebar
      :active-menu="activeMainMenu"
      @menu-change="handleMenuChange"
    />

    <!-- 中间：子菜单（仅在有子菜单时显示） -->
    <SubMenu v-if="showSubMenu" :active-main-menu="activeMainMenu" />

    <!-- 右侧：主内容区域 -->
    <div class="flex-1 overflow-auto">
      <slot />
    </div>
  </div>
</template>
