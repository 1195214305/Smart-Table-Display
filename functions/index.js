/**
 * 边缘函数统一入口
 * 根据请求路径分发到对应的处理函数
 */

async function fetch(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // API 路由分发
  if (path === '/api/analyze') {
    return handleAnalyze(request, corsHeaders)
  }

  if (path === '/api/health') {
    return handleHealth(request, corsHeaders)
  }

  // 非 API 请求，返回 404 让 ESA 处理静态资源
  return new Response(null, { status: 404 })
}

/**
 * 健康检查接口
 */
async function handleHealth(request, corsHeaders) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    edge: 'aliyun-esa'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

/**
 * AI数据分析接口
 * 使用千问API分析表格数据
 */
async function handleAnalyze(request, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { apiKey, data } = body

    if (!apiKey || !data) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 构建提示词
    const prompt = `请分析以下表格数据，提供数据洞察和建议：

表头：${data.headers.join(', ')}

数据样本（前10行）：
${data.rows.map(row => row.join(', ')).join('\n')}

请提供：
1. 数据概览和统计特征
2. 发现的模式或趋势
3. 潜在的问题或异常
4. 改进建议`

    // 调用千问API
    const qianwenResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      })
    })

    if (!qianwenResponse.ok) {
      throw new Error('千问API调用失败')
    }

    const result = await qianwenResponse.json()
    const insight = result.output?.choices?.[0]?.message?.content || '分析失败'

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: '分析失败',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

export default { fetch }
