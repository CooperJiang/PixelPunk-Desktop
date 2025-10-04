<script setup lang="ts">
import { ref } from "vue";
import IconSidebar from "./IconSidebar.vue";
import SubMenu from "./SubMenu.vue";

// 当前选中的主菜单
const activeMainMenu = ref("home");
// 子菜单是否展开
const isSubMenuOpen = ref(true);

const handleMenuChange = (menuId: string) => {
  activeMainMenu.value = menuId;
  isSubMenuOpen.value = true;
};
</script>

<template>
  <div class="flex h-full w-full">
    <!-- 左侧：图标侧边栏 -->
    <IconSidebar
      :active-menu="activeMainMenu"
      @menu-change="handleMenuChange"
    />

    <!-- 中间：子菜单 -->
    <SubMenu v-show="isSubMenuOpen" :active-main-menu="activeMainMenu" />

    <!-- 右侧：主内容区域 -->
    <div class="flex-1 overflow-auto">
      <slot />
    </div>
  </div>
</template>
