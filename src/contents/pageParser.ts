import { Readability } from "@mozilla/readability"
import Turndown from "turndown"

import type { Article, Message } from "~types"

function notifyExtension() {
  const content = document.documentElement.outerHTML
  const parser = new DOMParser()
  const dom = parser.parseFromString(content, "text/html")
  const article = getArticle(dom)
  if (!article || !chrome) return

  const markdownContent = getMarkDown(article)

  const message: Message<Article> = {
    target: "background",
    payload: { ...article, markdownContent }
  }

  chrome.runtime.sendMessage(message)
}

export {}

window.addEventListener("load", () => {
  notifyExtension()
})

function getArticle(dom: Document): Article {
  const reader = new Readability(dom)
  try {
    const article = reader.parse()
    return article
  } catch (error) {
    console.error("error while parsing")
    return null
  }
}

function getMarkDown(article: Article) {
  return new Turndown({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*"
  }).turndown(article.content)
}
