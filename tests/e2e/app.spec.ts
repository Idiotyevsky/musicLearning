import { expect, test } from '@playwright/test'

test('首页进入课程并完成一道即时练习', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /真正理解/ })).toBeVisible()
  await page.getByRole('link', { name: /开始系统学习/ }).click()
  await expect(page.getByRole('heading', { name: '声音为什么有高低？' })).toBeVisible()
  await page.locator('.lesson-stepper').getByRole('button', { name: /即时练习/ }).click()
  await page.getByRole('button', { name: /A\s*频率/ }).click()
  await page.getByRole('button', { name: '提交答案' }).click()
  await expect(page.getByText(/回答正确/)).toBeVisible()
})

test('主导航切换独立路由而不是页内锚点', async ({ page }) => {
  await page.goto('/')
  await page.locator('.desktop-nav').getByRole('link', { name: '乐理实验室' }).click()
  await expect(page).toHaveURL(/\/lab$/)
  await page.getByRole('button', { name: '和弦拆解' }).click()
  await expect(page).toHaveURL(/\/lab\?tab=chord$/)
})

test('实验室生成 F 大调并展示降 B', async ({ page }) => {
  await page.goto('/lab?tab=scale')
  await page.getByLabel('主音').selectOption('F')
  await expect(page.getByRole('heading', { name: /F · G · A · B♭/ })).toBeVisible()
  await expect(page.getByText('F · 大调音阶')).toBeVisible()
})

test('歌曲案例可移调并显示和弦级数', async ({ page }) => {
  await page.goto('/songs/morning-road')
  await expect(page.getByText('I', { exact: true }).first()).toBeVisible()
  await page.getByLabel('移调').selectOption('2')
  await expect(page.getByRole('heading', { name: /A 大调/ })).toBeVisible()
})

test('移动端可通过底部导航进入练习', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.locator('.mobile-nav').getByRole('link', { name: /练习/ }).click()
  await expect(page.getByRole('heading', { name: /每一道错题/ })).toBeVisible()
})
