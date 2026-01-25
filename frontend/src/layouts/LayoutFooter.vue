<template>
  <footer class="bg-primary-800 h-[318px]">
    <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 h-full">
      <div
        class="flex justify-between items-center h-12 border-b border-neutral-300 pt-16 pb-12"
      >
        <router-link to="/" class="flex items-center">
          <img src="/logo-text-v2.png" alt="LiveFit+" class="h-6 w-auto" />
          <span class="sr-only">LiveFit+</span>
        </router-link>

        <nav>
          <ul class="flex gap-6">
            <li>
              <router-link
                to="/coaches"
                class="text-neutral-300 hover:text-primary-0 transition-colors font-medium text-base leading-[150%]"
                >尋找教練</router-link
              >
            </li>
            <li>
              <router-link
                to="/fitness-plans"
                class="text-neutral-300 hover:text-primary-0 transition-colors font-medium text-base leading-[150%]"
                >健身方案</router-link
              >
            </li>
          </ul>
        </nav>
      </div>

      <div class="flex justify-center items-center gap-6 pt-12">
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <img src="/facebook.png" alt="Facebook" class="w-8 h-8" />
        </a>
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <img src="/instagram.png" alt="Instagram" class="w-8 h-8" />
        </a>
        <a
          href="https://www.x.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
        >
          <img src="/x.png" alt="X" class="w-8 h-8" />
        </a>
      </div>

      <p
        class="text-center text-neutral-300 font-normal text-base leading-[150%] pt-4"
      >
        © 2025 LiveFit+. All rights reserved.
      </p>
    </div>
  </footer>
</template>
