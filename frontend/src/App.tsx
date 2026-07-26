import { useCallback, useEffect, useState } from 'react'
import { C1Chat, ThemeProvider } from '@thesysai/genui-sdk'
import '@crayonai/react-ui/styles/index.css'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/chat'

const STARTER_PROMPTS = [
  {
    label: 'Market pulse',
    text: "Summarize today's Indian market with the strongest bullish and bearish signals.",
    icon: 'pulse',
  },
  {
    label: 'Compare segments',
    text: 'Compare the current outlook for Indian large-cap, mid-cap, and small-cap stocks.',
    icon: 'compare',
  },
  {
    label: 'News impact',
    text: 'Explain the market events having the greatest impact on investor sentiment today.',
    icon: 'news',
  },
  {
    label: 'Global context',
    text: 'Connect the latest global market developments to likely movements in Indian equities.',
    icon: 'globe',
  },
] as const

function PromptIcon({ name }: { name: (typeof STARTER_PROMPTS)[number]['icon'] }) {
  const paths = {
    pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
    compare: (
      <>
        <path d="M7 20V10M12 20V4M17 20v-7" />
        <path d="M4 20h16" />
      </>
    ),
    news: (
      <>
        <path d="M5 4h14v16H5z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function sendPrompt(text: string) {
  const input = document.querySelector(
    'textarea, input[type="text"], [contenteditable="true"]',
  ) as HTMLTextAreaElement | HTMLInputElement | HTMLElement | null

  if (!input) return false

  if ('value' in input) {
    const prototype =
      input instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
    setter?.call(input, text)
  } else {
    input.textContent = text
  }

  input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))

  window.setTimeout(() => {
    const form = input.closest('form')
    if (form) {
      form.requestSubmit()
      return
    }

    document
      .querySelector<HTMLButtonElement>(
        'button[type="submit"], button[aria-label*="send" i]',
      )
      ?.click()
  }, 120)

  return true
}

function App() {
  const [showStarters, setShowStarters] = useState(true)

  const handleStarter = useCallback((text: string) => {
    if (sendPrompt(text)) setShowStarters(false)
  }, [])

  useEffect(() => {
    const handleInteraction = (event: Event) => {
      const target = event.target as HTMLElement
      if (target.matches('textarea, input[type="text"], [contenteditable="true"]')) {
        setShowStarters(false)
      }
    }

    const handleNewChat = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const control = target.closest('button, a')
      const name = `${control?.textContent ?? ''} ${control?.getAttribute('aria-label') ?? ''}`
      if (name.toLowerCase().includes('new chat')) {
        window.setTimeout(() => setShowStarters(true), 150)
      }
    }

    document.addEventListener('input', handleInteraction)
    document.addEventListener('submit', handleInteraction)
    document.addEventListener('click', handleNewChat)
    return () => {
      document.removeEventListener('input', handleInteraction)
      document.removeEventListener('submit', handleInteraction)
      document.removeEventListener('click', handleNewChat)
    }
  }, [])

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="product-bar">
        <a className="brand" href="/" aria-label="Market Insight home">
          <span className="brand-mark">
            <svg viewBox="0 0 28 28" aria-hidden="true">
              <path d="M5 20 11 14l4 3 8-10" />
              <path d="M18 7h5v5" />
            </svg>
          </span>
          <span>
            <strong>Market Insight</strong>
            <small>AI research workspace</small>
          </span>
        </a>
        <div className="live-status" aria-label="Live market data available">
          <span />
          Live data
        </div>
      </header>

      <section className="workspace" aria-label="Market Insight chat workspace">
        {showStarters && (
          <div className="welcome-panel">
            <div className="eyebrow">RESEARCH WITH CONTEXT</div>
            <h1>Turn market noise into a clearer point of view.</h1>
            <p>
              Ask about prices, fundamentals, ownership, analyst sentiment, or
              the story behind a market move.
            </p>
            <div className="prompt-grid">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  className="prompt-card"
                  key={prompt.label}
                  onClick={() => handleStarter(prompt.text)}
                  type="button"
                >
                  <span className="prompt-icon">
                    <PromptIcon name={prompt.icon} />
                  </span>
                  <span>
                    <strong>{prompt.label}</strong>
                    <small>{prompt.text}</small>
                  </span>
                  <span className="arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-surface">
          <ThemeProvider mode="dark">
            <C1Chat
              apiUrl={API_URL}
              agentName="Market Insight"
              logoUrl="/icon.png"
              formFactor="full-page"
            />
          </ThemeProvider>
        </div>
      </section>

      <footer className="disclaimer">
        Market data may be delayed. Research support only — not financial advice.
      </footer>
    </main>
  )
}

export default App
