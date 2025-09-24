
'use client'
import { useEffect, useRef } from 'react'

export default function ChartPage({ params }: { params: { symbol: string }}) {
  const ref = useRef<HTMLDivElement>(null)
  const symbol = decodeURIComponent(params.symbol) || 'FX_IDC:EURUSD'

  useEffect(() => {
    if (!ref.current) return
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({ symbol, interval:"60", theme:"dark", locale:"it", allow_symbol_change:true, autosize:true })
    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    ref.current.innerHTML = ''
    ref.current.appendChild(widget)
    ref.current.appendChild(script)
  }, [symbol])

  return <div style={{ height: 600 }} className="tradingview-widget-container" ref={ref}></div>
}
