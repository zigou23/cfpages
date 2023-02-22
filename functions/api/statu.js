export async function onRequest(context) {
  const { request } = context;
  
  // 允许访问的域名列表
  const allowedOrigins = ['https://qsim.top'];
  
  // 判断请求来源是否在允许访问的域名列表中
  const origin = request.headers.get('Referer');
  if (!allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  // 如果请求来源合法，则继续处理请求
  let response = await fetch('https://api.uptimerobot.com/v2/getMonitors', request);
  response = new Response(response.body, response);

  response.headers.set('Access-Control-Allow-Methods', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Access-Token');
  response.headers.set('Access-Control-Expose-Headers', '*');
  return response;
}
