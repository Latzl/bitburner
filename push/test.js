
import * as allin from './allin';
import {tst} from './test1';

// import * as test1 from './test1';
let ms;
export async function main(ns) {
  ms = ns;
  ms.clearLog();
  //   ms.exec('/attack/hack.js', 'home', 60, 'n00dles');
  // var str = ms.getScriptRam('/attack/hack.js', 'omega-net')
  //   var str = ms.growthAnalyzeSecurity(999, 'zb-institute', 1)
  var targetHost = 'phantasy';
  // var str = Math.ceil(ms.growthAnalyze(targetHost, 4 / 3, 1))
  var str = allin.moneyFix(ms.getServerMoneyAvailable(targetHost)) + '/' +
      allin.moneyFix(ms.getServerMaxMoney(targetHost));
  ms.tprint(str);
  var str1 = ms.getServerSecurityLevel(targetHost).toFixed(1) + '/' +
      ms.getServerMinSecurityLevel(targetHost).toFixed(1)
  ms.tprint(str1);
  var str2 = ms.weakenAnalyze(815, 1);
  var str3 = ms.getServerGrowth(targetHost);
  ms.tprint(str3);
}

// test function
function com() {
  return 1;
}
