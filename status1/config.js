// 配置
window.Config = {

  // 站点名
  SiteName: 'Uptime Status',

  // 站点链接
  SiteUrl: '/status/',

  // UptimeRobot Api 域名 api.uptimerobot.com
  // 只需填写域名部分，默认为官网域名 qsim-status.zigou.workers.dev
  // 因官网 API 时不时的会 CROS 报错，可填自定义反代域名 p.ffvv.ml/https/api.uptimerobot.com qsim-status.zigou.workers.dev status-api.qsim.top
  // 详见 https://github.com/yb/uptime-status/ 说明
  ApiDomain: 'qsim.top/api/statu',

  // UptimeRobot Api Keys
  // 支持 Monitor-Specific 和 Read-Only 两只 Api Key
  ApiKeys: [
    'ur1680981-5f764d83f8204dffc2b2fac7',
  ],

  // 是否显示监测站点的链接
  ShowLink: true,

  // 日志天数
  // 虽然免费版说仅保存60天日志，但测试好像API可以获取90天的
  // 不过时间不要设置太长，容易卡，接口请求也容易失败
  CountDays: 90,

  // 导航栏菜单
  Navi: [
    {
      text: 'Homepage',
      url: 'https://qsim.top/'
    },
    {
      text: 'Blog',
      url: 'https://blog.qsim.top/'
    }
  ]
};
