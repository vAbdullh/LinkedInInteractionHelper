import { useState, useRef } from 'react'
import Papa from 'papaparse'
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

interface CsvRow {
  link: string
  visited?: string
  liked?: string
  commented?: string
  notes?: string
}

interface ImportResult {
  imported: number
  skipped: number
}

export function CsvImport() {
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImport = async (file: File) => {
    setLoading(true)
    setError(null)
    setResult(null)

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data.filter((r) => r.link && r.link.trim())

          // Fetch all existing links from Firestore
          const existingSnap = await getDocs(collection(db, 'posts'))
          const existingLinks = new Set(
            existingSnap.docs.map((d) => (d.data() as { link: string }).link)
          )

          const newRows = rows.filter((r) => !existingLinks.has(r.link.trim()))
          const skippedCount = rows.length - newRows.length

          // Batch write in groups of 500 (Firestore limit)
          let imported = 0
          const batchSize = 500
          for (let i = 0; i < newRows.length; i += batchSize) {
            const batch = writeBatch(db)
            const chunk = newRows.slice(i, i + batchSize)
            for (const row of chunk) {
              const ref = doc(collection(db, 'posts'))
              batch.set(ref, {
                link: row.link.trim(),
                name: '',
                comment: '',
                status: 'pending',
                notes: row.notes?.trim() ?? '',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            }
            await batch.commit()
            imported += chunk.length
          }

          setResult({ imported, skipped: skippedCount })
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Import failed')
        } finally {
          setLoading(false)
          if (fileRef.current) fileRef.current.value = ''
        }
      },
      error: (err) => {
        setError(err.message)
        setLoading(false)
      },
    })
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImport(file)
  }

  return (
    <div className="border border-neutral-800 p-4">
      <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">CSV Import</p>
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={onFileChange}
          className="hidden"
          id="csv-file"
        />
        <label
          htmlFor="csv-file"
          className={`text-xs px-3 py-1.5 border border-neutral-700 text-neutral-300 hover:border-neutral-500 cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {loading ? 'Importing...' : 'Select CSV'}
        </label>

        {result && (
          <span className="text-xs text-neutral-400 font-mono">
            {result.imported} imported, {result.skipped} skipped
          </span>
        )}
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    </div>
  )
}
