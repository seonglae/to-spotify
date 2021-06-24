import { chromium as engine, Page, Browser } from 'playwright'

const consola = require('consola')

export class Crawler {
  nextQuery: string = ''

  async getList(page: Page, queries: Array<string>, filters: Array<Array<string>>) {
    const all: Array<string> = []
    let pg = 1
    while (true) {
      const { lists, href } = await page.evaluate((queries): { href?: string; lists: Array<string> } => {
        const nameSets: Array<Array<string>> = []
        for (const query of queries) {
          const elements: NodeListOf<HTMLElement> = document.querySelectorAll(query)
          elements.forEach((element: HTMLElement, index: number) => {
            let name = element.innerText
            filters[index].map(filter => (name = name.replace(filter, '')))
            if (nameSets[index]) nameSets[index].push(name)
            else nameSets[index] = [name]
          })
        }
        const lists: Array<string> = nameSets.map(nameSet => nameSet.join(' '))
        const nextBtn = <HTMLAnchorElement>document.querySelector(this.nextQuery)
        return { href: nextBtn?.onclick ? undefined : nextBtn.href, lists }
      }, queries)
      all.push(...lists)
      consola.success(`Page ${pg++} Added`)
      if (href) await page.goto(href)
      else break
    }
    consola.info('Lists\n')
    console.log(all.join('\n'))
    return all
  }

  async getQueryText(page: Page, query: string): Promise<string> {
    return await page.evaluate((): string => {
      const element = <HTMLElement>document.querySelector(query)
      const title: string = element.innerText
      return title
    })
  }

  async goToPage(url: string): Promise<{ page: Page; browser: Browser }> {
    const browser = await engine.launch()
    const context = await browser.newContext()
    const page: Page = await context.newPage()
    await page.goto(url)
    return { page, browser }
  }
}

export default Crawler
