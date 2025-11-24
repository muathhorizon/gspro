import { useI18n } from 'vue-i18n'
import introJs from 'intro.js'
import 'intro.js/introjs.css'

let introInstance: introJs.IntroJs | null = null

export function useTour() {
  const { t } = useI18n()

  function isMobile(): boolean {
    return window.innerWidth <= 768
  }

  function ensureTooltipVisible(tooltipElement: HTMLElement) {
    setTimeout(() => {
      const rect = tooltipElement.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      const bottomOverflow = rect.bottom - viewportHeight
      const topOverflow = rect.top

      if (bottomOverflow > 0) {
        window.scrollTo({
          top: scrollTop + bottomOverflow + (isMobile() ? 60 : 40),
          behavior: 'smooth'
        })
      } else if (topOverflow < 0) {
        window.scrollTo({
          top: scrollTop + topOverflow - (isMobile() ? 60 : 40),
          behavior: 'smooth'
        })
      }
    }, 300)
  }

  function waitForElement(selector: string, timeout = 10000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector)
        if (element) {
          observer.disconnect()
          resolve(element)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      setTimeout(() => {
        observer.disconnect()
        reject(new Error(`Element ${selector} not found`))
      }, timeout)
    })
  }

  async function startTour(onThemeSelect: (callback: () => void) => void) {
    try {
      // Wait for ANY theme card to be rendered
      await waitForElement('.theme-card[data-tour-theme]', 10000)
    } catch (error) {
      console.error('Tour cancelled: theme cards not found', error)
      return
    }

    if (introInstance) {
      introInstance.exit(false)
    }

    introInstance = introJs()

    document.querySelectorAll('.theme-card, .level-card').forEach(el => {
      (el as HTMLElement).style.pointerEvents = 'none';
    });

    // Get the first two theme cards dynamically
    const themeCards = document.querySelectorAll('.theme-card[data-tour-theme]')
    const firstTheme = themeCards[0] as HTMLElement
    const secondTheme = themeCards[1] as HTMLElement

    if (!firstTheme) {
      console.error('No theme cards found')
      return
    }

    const firstThemeName = firstTheme.getAttribute('data-tour-theme') || 'theme1'
    const secondThemeName = secondTheme?.getAttribute('data-tour-theme') || 'theme2'

    const themeSteps = []
    const mobile = isMobile()

    if (mobile) {
      themeSteps.push(
        {
          element: `[data-tour-theme="${firstThemeName}"]`,
          intro: `<div class="intro-custom">
            <h3>🎯 ${t('tourFootballTitle')}</h3>
            <p>${t('tourFootball')}</p>
          </div>`,
          position: 'bottom',
          disableInteraction: true,
          tooltipClass: 'intro-card-tooltip'
        }
      )

      if (secondTheme) {
        themeSteps.push({
          element: `[data-tour-theme="${secondThemeName}"]`,
          intro: `<div class="intro-custom">
            <h3>🎮 ${t('tourGameTitle')}</h3>
            <p>${t('tourGame')}</p>
          </div>`,
          position: 'bottom',
          disableInteraction: true,
          tooltipClass: 'intro-card-tooltip'
        })
      }

      themeSteps.push({
        element: '.themes-grid',
        intro: `<div class="intro-custom">
          <h3>${t('tourSelectThemeTitle')}</h3>
          <p>${t('tourSelectTheme')}</p>
        </div>`,
        position: 'bottom',
        disableInteraction: false,
        tooltipClass: 'intro-section-tooltip'
      })
    } else {
      themeSteps.push(
        {
          element: `[data-tour-theme="${firstThemeName}"]`,
          intro: `<div class="intro-custom">
            <h3>🎯 ${t('tourFootballTitle')}</h3>
            <p>${t('tourFootball')}</p>
          </div>`,
          position: 'bottom',
          disableInteraction: true
        }
      )

      if (secondTheme) {
        themeSteps.push({
          element: `[data-tour-theme="${secondThemeName}"]`,
          intro: `<div class="intro-custom">
            <h3>🎮 ${t('tourGameTitle')}</h3>
            <p>${t('tourGame')}</p>
          </div>`,
          position: 'bottom',
          disableInteraction: true
        })
      }

      themeSteps.push({
        element: '.themes-grid',
        intro: `<div class="intro-custom">
          <h3>${t('tourSelectThemeTitle')}</h3>
          <p>${t('tourSelectTheme')}</p>
        </div>`,
        position: 'bottom',
        disableInteraction: false,
        tooltipClass: 'intro-section-tooltip'
      })
    }

    introInstance.setOptions({
      steps: themeSteps,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      showStepNumbers: false,
      showBullets: true,
      showProgress: false,
      scrollToElement: true,
      scrollPadding: mobile ? 120 : 30,
      overlayOpacity: 0.85,
      nextLabel: 'التالي →',
      prevLabel: '← السابق',
      doneLabel: 'فهمت!',
      skipLabel: 'تخطي',
      hidePrev: true
    })

    introInstance.onafterchange(function() {
      const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement
      if (tooltip) {
        ensureTooltipVisible(tooltip)
      }
    })

    let tourCompleted = false

  introInstance.oncomplete(async () => {
  sessionStorage.setItem('hasSeenTour', 'true')

  document.querySelectorAll('.level-card').forEach(el => {
    (el as HTMLElement).style.pointerEvents = 'auto'
  })


 

  introInstance = null
})

    introInstance.oncomplete(() => {
      tourCompleted = true
      document.querySelectorAll('.theme-card').forEach(el => {
        (el as HTMLElement).style.pointerEvents = 'auto';
      });
      onThemeSelect(async () => {
        try {
          await waitForElement('.level-card.easy', 5000)
          startLevelTour()
        } catch (error) {
          console.error('Level cards not found', error)
          sessionStorage.setItem('hasSeenTour', 'true')
        }
      })
    })

    introInstance.start()
  }

  function startLevelTour() {
    if (introInstance) {
      introInstance.exit(false)
    }

    introInstance = introJs()
const mobile = isMobile()
   const levelSteps = [
  {
    element: '.level-card.easy',
    intro: `<div class="intro-custom">
      <h3>🟢 ${t('tourTitleEasy')}</h3>
      <p>${t('tourStepEasy')}</p>
    </div>`,
    position: 'bottom',
    disableInteraction: true,
    tooltipClass: mobile ? 'intro-level-tooltip' : ''
  },
  {
    element: '.level-card.medium',
    intro: `<div class="intro-custom">
      <h3>🟠 ${t('tourTitleMedium')}</h3>
      <p>${t('tourStepMedium')}</p>
    </div>`,
    position: 'bottom',
    disableInteraction: true,
    tooltipClass: mobile ? 'intro-level-tooltip' : ''
  },
  {
    element: '.level-card.hard',
    intro: `<div class="intro-custom">
      <h3>🔴 ${t('tourTitleHard')}</h3>
      <p>${t('tourStepHard')}</p>
    </div>`,
    position: 'bottom',
    disableInteraction: true,
    tooltipClass: mobile ? 'intro-level-tooltip' : ''
  }
]

    introInstance.setOptions({
      steps: levelSteps,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      showStepNumbers: false,
      showBullets: true,
      showProgress: false,
      scrollToElement: true,
      scrollPadding: isMobile() ? 100 : 30,
      overlayOpacity: 0.85,
      nextLabel: 'التالي →',
      prevLabel: '← السابق',
      doneLabel: 'فهمت!',
      skipLabel: 'تخطي',
      hidePrev: true
    })

    // ✅ نفس المنطق للموبايل بخطوات المستويات
    introInstance.onafterchange(() => {
      const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement
      if (tooltip) ensureTooltipVisible(tooltip)
    })

    introInstance.oncomplete(() => {
      sessionStorage.setItem('hasSeenTour', 'true')
      document.querySelectorAll('.level-card').forEach(el => {
        (el as HTMLElement).style.pointerEvents = 'auto';
      });
      introInstance = null
    })

    introInstance.onexit(() => {
      sessionStorage.setItem('hasSeenTour', 'true')
       const easyCard = document.querySelector('.level-card.easy') as HTMLElement
console.log('easycard',easyCard);
  if (easyCard) {
    console.log('scroll');
    easyCard.scrollIntoView({
      behavior: 'smooth',
      block: 'center',   // ممكن تستخدم 'start' لو بدك يكون بالأعلى تماماً
      inline: 'nearest'
    })
  }
      introInstance = null
    })

    introInstance.start()
  }

  return {
    startTour
  }
}
