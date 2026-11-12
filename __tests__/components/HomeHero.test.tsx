import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomeHero } from '@/components/home/HomeHero'

describe('HomeHero', () => {
  it('renders the hero sentence in three lines with shrinking delays', () => {
    render(<HomeHero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent!.replace(/\s+/g, ' ').trim()).toBe('만들고, 내놓고, 수익까지 도전합니다')
    expect(h1.textContent).not.toMatch(/\.\s*$/) // 끝에 마침표 없음
    expect(h1.querySelectorAll('.hero-line')).toHaveLength(3)
    const ds = [...h1.querySelectorAll<HTMLElement>('.hero-word')].map((w) => w.style.getPropertyValue('--d'))
    expect(ds).toEqual(['0', '90', '170', '240'])
    expect(screen.getByText('AI와 함께 답을 찾아가며, 그 과정을 기록으로 남깁니다.')).toBeTruthy()
  })
  it('the gathering slot is decorative and the canvas is there', () => {
    const { container } = render(<HomeHero />)
    expect(container.querySelector('.hero-slot')!.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('canvas')).not.toBeNull()
  })
})
