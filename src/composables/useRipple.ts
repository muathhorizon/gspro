import { onMounted, onUnmounted, type Ref } from 'vue';

export function useRipple(elementRef: Ref<HTMLElement | null>) {
  const createRipple = (event: MouseEvent) => {
    const element = elementRef.value;
    if (!element) return;

    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple-effect');

    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  onMounted(() => {
    const element = elementRef.value;
    if (element) {
      element.addEventListener('click', createRipple);
    }
  });

  onUnmounted(() => {
    const element = elementRef.value;
    if (element) {
      element.removeEventListener('click', createRipple);
    }
  });
}
