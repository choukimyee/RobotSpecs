import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

// POST /api/scrape - 抓取网页数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: '请提供URL' },
        { status: 400 }
      )
    }
    
    // 验证 URL 格式
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: '无效的URL格式' },
        { status: 400 }
      )
    }
    
    // 抓取页面
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    })
    
    const html = response.data
    const $ = cheerio.load(html)
    
    // 提取基础信息
    const title = $('title').text().trim()
    const description = $('meta[name="description"]').attr('content') || ''
    
    // 提取所有图片
    const images: string[] = []
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src) {
        // 转换为绝对路径
        const absoluteUrl = src.startsWith('http') ? src : new URL(src, url).href
        images.push(absoluteUrl)
      }
    })
    
    // 提取表格数据 (通常参数在表格中)
    const tables: Array<{ headers: string[]; rows: string[][] }> = []
    $('table').each((_, table) => {
      const headers: string[] = []
      const rows: string[][] = []
      
      $(table).find('th').each((_, th) => {
        headers.push($(th).text().trim())
      })
      
      $(table).find('tr').each((_, tr) => {
        const row: string[] = []
        $(tr).find('td').each((_, td) => {
          row.push($(td).text().trim())
        })
        if (row.length > 0) {
          rows.push(row)
        }
      })
      
      if (rows.length > 0) {
        tables.push({ headers, rows })
      }
    })
    
    // 提取定义列表数据 (dl/dt/dd)
    const definitions: Array<{ term: string; definition: string }> = []
    $('dl').each((_, dl) => {
      $(dl).find('dt').each((i, dt) => {
        const term = $(dt).text().trim()
        const dd = $(dl).find('dd').eq(i)
        const definition = dd.text().trim()
        if (term && definition) {
          definitions.push({ term, definition })
        }
      })
    })
    
    // 提取带有 label/value 结构的数据
    const labelValues: Array<{ label: string; value: string }> = []
    $('[class*="spec"], [class*="param"], [class*="detail"], [class*="info"]').each((_, el) => {
      const text = $(el).text().trim()
      // 尝试匹配 "标签: 值" 或 "标签：值" 格式
      const match = text.match(/^(.+?)[：:]\s*(.+)$/)
      if (match) {
        labelValues.push({ label: match[1].trim(), value: match[2].trim() })
      }
    })
    
    // 尝试提取价格
    let price: number | null = null
    const pricePatterns = [
      /¥\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      /￥\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*元/,
      /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    ]
    
    const bodyText = $('body').text()
    for (const pattern of pricePatterns) {
      const match = bodyText.match(pattern)
      if (match) {
        price = parseFloat(match[1].replace(/,/g, ''))
        break
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        url,
        title,
        description,
        images: images.slice(0, 20), // 限制图片数量
        tables,
        definitions,
        labelValues: labelValues.slice(0, 50),
        price,
      },
    })
  } catch (error) {
    console.error('Error scraping URL:', error)
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json(
          { success: false, error: '请求超时，请稍后重试' },
          { status: 408 }
        )
      }
      if (error.response?.status === 403) {
        return NextResponse.json(
          { success: false, error: '该网站禁止访问' },
          { status: 403 }
        )
      }
      if (error.response?.status === 404) {
        return NextResponse.json(
          { success: false, error: '页面不存在' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: '抓取页面失败，请检查URL是否正确' },
      { status: 500 }
    )
  }
}
