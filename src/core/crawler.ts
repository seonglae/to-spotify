import { chromium as engine, Page, Browser } from 'playwright'

const consola = require('consola')

export class Crawler {
  nextQueries: Array<string>

  constructor(options: { nextQueries: Array<string> }) {
    this.nextQueries = options.nextQueries
  }

  async getList(page: Page, queries: Array<string>, filters: Array<string>) {
    const all: Array<string> = []
    let pg = 1
    while (true) {
      const { lists, href } = await page.evaluate(
        ({ queries, filters, nextQueries }): { href?: string; lists: Array<string> } => {
          const nameSets: Array<Array<string>> = []
          for (const query of queries) {
            const elements: NodeListOf<HTMLElement> = document.querySelectorAll(query)
            elements.forEach((element: HTMLElement, index: number) => {
              let name = element.innerText
              filters.map(filter => (name = name.replace(filter, '')))
              if (nameSets[index]) nameSets[index].push(name)
              else nameSets[index] = [name]
            })
          }
          const lists: Array<string> = nameSets.map(nameSet => nameSet.join(' '))
          let nextBtn
          for (const nextQuery of nextQueries) {
            nextBtn = <HTMLAnchorElement>document.querySelector(nextQuery)
            if (nextBtn) break
          }
          if (!nextBtn) throw Error("Can't find next Button")

          let href = nextBtn?.onclick ? undefined : nextBtn.href
          if (typeof href === 'string') {
            if (href.includes('javascript:')) eval(href)
            if (href.includes('javascript:;')) href = undefined
          }
          return { href, lists }
        },
        { queries, filters, nextQueries: this.nextQueries }
      )
      all.push(...lists)
      consola.success(`Page ${pg++} Added`)
      if (typeof href === 'string') {
        if (!href.includes('javascript:')) await page.goto(href)
      } else break
    }
    consola.info('Lists\n')
    console.log(all.join('\n'))
    return all
  }

  async getQueryText(page: Page, query: string): Promise<string> {
    return await page.evaluate((query): string => {
      const element = <HTMLElement>document.querySelector(query)
      const title: string = element.innerText
      return title
    }, query)
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
