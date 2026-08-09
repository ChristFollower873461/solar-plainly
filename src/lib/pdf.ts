import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { ContractPage } from '../types'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const MAX_FILE_BYTES = 15 * 1024 * 1024
const MAX_PAGES = 150

const assertFileSize = (file: File) => {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('That file is larger than 15 MB. Split it into smaller files and try again.')
  }
}

const readPdf = async (file: File): Promise<ContractPage[]> => {
  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = pdfjs.getDocument({ data })
  const document = await loadingTask.promise

  try {
    if (document.numPages > MAX_PAGES) {
      throw new Error('That PDF has more than 150 pages. Upload the agreement in smaller sections.')
    }

    const pages: ContractPage[] = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      pages.push({ number: pageNumber, text })
    }

    const extractedCharacters = pages.reduce((total, page) => total + page.text.length, 0)
    if (extractedCharacters < 80) {
      throw new Error(
        'We could not read enough text from this PDF. It may be scanned. Run OCR first, or paste the contract text instead.',
      )
    }

    return pages
  } finally {
    await loadingTask.destroy()
  }
}

const readText = async (file: File): Promise<ContractPage[]> => {
  const text = await file.text()
  const chunks = text.split(/\f/)
  if (!text.trim()) throw new Error('That text file is empty.')
  return chunks.map((chunk, index) => ({ number: index + 1, text: chunk.trim() }))
}

export const readContractFile = async (file: File): Promise<ContractPage[]> => {
  assertFileSize(file)
  const extension = file.name.toLowerCase().split('.').pop()
  if (file.type === 'application/pdf' || extension === 'pdf') return readPdf(file)
  if (file.type.startsWith('text/') || extension === 'txt') return readText(file)
  throw new Error('Use a PDF or plain-text file for contract review.')
}
