export async function onRequest(context) {
  // Contents of context object
  const {
      request, // same as existing Worker API
      env, // same as existing Worker API
      params, // if filename includes [id] or [[path]]
      waitUntil, // same as ctx.waitUntil in existing Worker API
      next, // used for middleware or to fetch assets
      data, // arbitrary space for passing data between middlewares
  } = context;

  // 域名检测 - 只允许 qsim.top 及其子域名访问
  let url = new URL(request.url);
  const hostname = url.hostname;
  // 检查域名是否为 qsim.top 或其子域名
  if (hostname !== 'qsim.top' && !hostname.endsWith('.qsim.top')) {
    return new Response('Forbidden: Invalid domain', { 
      status: 403,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed.', { 
      status: 405,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  // 处理预检请求
  let response = await fetch('https://api.uptimerobot.com/v2/getMonitors', request);
  response = new Response(response.body, response);
  
  // 这个填写需要的域名，比如('Access-Control-Allow-Origin', 'https://lab.qsim.top')，跨域会访问访问不了，因为我是同域名访问，所以不需要
  // response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Origin', 'https://qsim.top');
  response.headers.set('Access-Control-Allow-Methods', 'POST');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Access-Token');
  response.headers.set('Access-Control-Expose-Headers', '*');
  return response;
}