window.Config = {

  // 显示标题
  SiteName: 'Uptime Status',

  // UptimeRobot Api 域名 api.uptimerobot.com
  // 只需填写域名部分，默认为官网域名
  // 因官网 API 时不时的会 CROS 报错，可填自定义反代域名 api.uptimerobot.com status-api.qsim.top
  // 详见 https://github.com/yb/uptime-status/ 说明
  ApiDomain: 'qsim.top/api/statu',

  // UptimeRobot Api Keys
  // 支持 Monitor-Specific 和 Read-Only
  ApiKeys: [
    'ur1680981-5f764d83f8204dffc2b2fac7',
  ],

  // 日志天数
  CountDays: 60,

  // 是否显示检测站点的链接
  ShowLink: true,

  // 导航栏菜单
  Navi: [
    {
      text: 'Homepage',
      url: 'https://qsim.top/'
    },
    {
      text: 'Blog',
      url: 'https://blog.qsim.top/'
    },
  ],
};
