window.Config = {

  // 显示标题
  SiteName: 'Uptime Status',

  // 只需填写域名部分，默认为官网域名
  // 详见 https://github.com/yb/uptime-status/ 说明
  // 更多可以参考我的 https://github.com/zigou23/cfpages/blob/homepage/functions/api/statu.js
  // ApiDomain: '',
  // 空值为cors.status.org.cn/uptimerobot/v2/getMonitors
  // ApiDomain: 'api.uptimerobot.com/v2/getMonitors',  UptimeRobot Api 域名
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
