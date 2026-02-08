<template>
  <header class="bg-primary-900 border-primary-700">
    <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
      <div class="flex justify-between items-center h-20 relative">
        <h1 class="text-xl md:text-2xl font-bold text-primary-0">
          <router-link
            to="/"
            @click="closeMobileMenu"
            class="flex items-center"
          >
            <img src="/logo-text-v2.png" alt="LiveFit+" class="h-6 w-auto" />
            <span class="sr-only">LiveFit+</span>
          </router-link>
        </h1>

        <nav
          class="hidden md:flex md:absolute md:left-1/2 md:transform md:-translate-x-1/2"
        >
          <ul class="flex gap-6">
            <li>
              <router-link
                to="/coaches"
                class="text-neutral-300 hover:text-primary-0 transition-all font-medium text-base leading-[150%] pb-1 border-b-2 border-transparent"
                active-class="!font-bold !leading-[120%] !border-secondary-800 !text-primary-0"
                >尋找教練</router-link
              >
            </li>
            <li>
              <router-link
                to="/fitness-plans"
                class="text-neutral-300 hover:text-primary-0 transition-all font-medium text-base leading-[150%] pb-1 border-b-2 border-transparent"
                active-class="!font-bold !leading-[120%] !border-secondary-800 !text-primary-0"
                >健身方案</router-link
              >
            </li>
          </ul>
        </nav>

        <div class="hidden md:flex items-center gap-6">
          <router-link
            v-if="!name"
            to="/login"
            class="bg-secondary-800 hover:bg-secondary-700 text-primary-900 font-medium text-base leading-[150%] px-5 py-3 rounded transition-colors h-12 flex items-center justify-center"
            >立即加入</router-link
          >
          <p v-if="name" class="font-bold text-primary-0">
            歡迎，{{ name }}您好！
          </p>
          <router-link
            v-if="role === 'USER'"
            to="/user/dashboard"
            class="bg-secondary-800 hover:bg-secondary-700 text-primary-900 font-medium text-base leading-[150%] px-5 py-3 rounded transition-colors h-12 flex items-center justify-center"
          >
            會員介面
          </router-link>
          <router-link
            v-if="role === 'COACH'"
            to="/coach/profile"
            class="bg-secondary-800 hover:bg-secondary-700 text-primary-900 font-medium text-base leading-[150%] px-5 py-3 rounded transition-colors h-12 flex items-center justify-center"
          >
            教練介面
          </router-link>
          <router-link
            v-if="name"
            to="/"
            @click="logout"
            class="text-primary-0 hover:text-neutral-300 transition-colors flex items-center justify-center"
            aria-label="登出"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </router-link>
        </div>

        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 text-primary-300 hover:text-primary-0 focus:outline-none focus:ring-2 focus:ring-primary-600 rounded-lg"
          aria-label="Toggle menu"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="!isMobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <transition
        enter-active-class="transition-all duration-300 ease-out overflow-hidden"
        leave-active-class="transition-all duration-200 ease-in overflow-hidden"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <nav
          v-if="isMobileMenuOpen"
          class="md:hidden absolute top-20 left-0 right-0 bg-primary-900 border-b border-primary-700 pb-4 pt-4 z-50 shadow-lg"
        >
          <ul class="flex flex-col gap-3 px-4">
            <li v-if="name">
              <p class="font-bold text-primary-0">歡迎，{{ name }} 您好！</p>
            </li>
            <li>
              <router-link
                to="/coaches"
                @click="closeMobileMenu"
                class="inline-block py-2 text-neutral-300 hover:text-primary-0 transition-all font-medium text-base leading-[150%] border-b-2 border-transparent"
                active-class="!font-bold !leading-[120%] !border-secondary-800 !text-primary-0"
              >
                尋找教練
              </router-link>
            </li>
            <li>
              <router-link
                to="/fitness-plans"
                @click="closeMobileMenu"
                class="inline-block py-2 text-neutral-300 hover:text-primary-0 transition-all font-medium text-base leading-[150%] border-b-2 border-transparent"
                active-class="!font-bold !leading-[120%] !border-secondary-800 !text-primary-0"
              >
                健身方案
              </router-link>
            </li>
            <li v-if="!name">
              <router-link
                to="/login"
                @click="closeMobileMenu"
                class="inline-block py-2 text-neutral-300 hover:text-primary-0 transition-all font-medium text-base leading-[150%] border-b-2 border-transparent"
                active-class="!font-bold !leading-[120%] !border-secondary-800 !text-primary-0"
              >
                立即加入
              </router-link>
            </li>
            <li v-if="role === 'USER'">
              <router-link
                to="/user/dashboard"
                @click="closeMobileMenu"
                class="inline-block py-2 text-neutral-300 hover:text-primary-0 transition-all font-medium text-base leading-[150%] border-b-2 border-transparent"
                active-class="!font-bold !leading-[120%] !border-secondary-800 !text-primary-0"
              >
                會員介面
              </router-link>
            </li>
            <li v-if="role === 'COACH'">
              <router-link
                to="/coach/profile"
                @click="closeMobileMenu"
                class="inline-block py-2 text-neutral-300 hover:text-primary-0 transition-all font-medium text-base leading-[150%] border-b-2 border-transparent"
                active-class="!font-bold !leading-[120%] !border-secondary-800 !text-primary-0"
              >
                教練介面
              </router-link>
            </li>
            <li v-if="name">
              <button
                @click="closeMobileMenu(), logout()"
                class="inline-block py-2 text-neutral-300 hover:text-primary-0 transition-all font-medium text-base leading-[150%] w-full text-left"
              >
                登出
              </button>
            </li>
          </ul>
        </nav>
      </transition>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user.js";
import { removeCookie } from "../utils/cookie.js";

const router = useRouter();
const { name, role } = storeToRefs(useUserStore());
const { setCurrentUser } = useUserStore();

const isMobileMenuOpen = ref(false);

function logout() {
  removeCookie("token");
  setCurrentUser({ name: "", role: "" });
  router.push("/");
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>
