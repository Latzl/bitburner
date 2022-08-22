// From VSCode

/** @param {NS} ms */
/** @param {NS} ns */

import {bitFix, moneyFix, removeArr, sort} from './allin';
const copyScript = 'copyAttack.js';
const rootname = 'root';
let ms;

const portHackTools = [
  'BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe',
  'SQLInject.exe'
];
// caculate how tool I have;
var hackToolsHave = [];
function predue() {
  for (var i = 0; i < portHackTools.length; ++i) {
    if (ms.fileExists(portHackTools[i], 'home'))
      hackToolsHave.push(portHackTools[i])
  }
}
// args: {all: excute gm,han,who; gm: getMap(), han: hackAllNodes(), who:
// writeHostObj(), ps: purchaseMaxRamServer()
export async function main(ns) {
  ms = ns;
  ms.clearLog();
  predue();

  let root = new Node('home', rootname);
  let tre = new Tree(root)
  for (var i = 0; i < ms.args.length; ++i) {
    switch (ms.args[i]) {
      case 'gm':
        tre.getMap();
        break;
      case 'han':
        tre.hackAllNode();
        break;
      case 'who':
        tre.writeHostObj();
        break;
      case 'ps':
        if (await purchaseMaxRamServer()) {
          tre.writeHostObj();
          ms.exec(copyScript, 'home');
        }
        break;
      case 'all':
        var hacked = tre.hackAllNode();
        if (hacked.length > 0) {
          tre.writeHostObj();
          tre.getMap();
          ms.exec(copyScript, 'home');
        }
        break;
      default:
        ms.tprint('!!! arg error: ', ms.args[i]);
        break;
    }
  }

  hackToolsHave = [];
}

class Node {
  constructor(host, up) {
    ms.disableLog('ALL');
    this.host = host;
    this.info = ms.getServer(this.host);
    this.up = up;
    if (this.up == rootname) {
      this.distance = 0
    } else {
      this.distance = this.up.distance + 1;
    }
    var serverOut = ms.getPurchasedServers();
    serverOut.push('darkweb', this.up.host);
    this.down = removeArr(ms.scan(this.host), serverOut);
    this.link = _.cloneDeep(this.down);  // include root
    this.link.push(this.up.host);
    this.toDown = _.cloneDeep(this.down);  // deep copy
    this.canHack = this.canHack();
    this.maxMoney = this.info.moneyMax;
    this.lv = this.info.requiredHackingSkill;
    this.minLevel = this.info.minDifficulty;
    this.access = ms.hasRootAccess(this.host)
  }
  remove2down(i) {
    this.toDown.splice(i, 1);
  }
  reset2down() {
    this.toDown = _.cloneDeep(this.down);
  }
  canHack() {
    const info = this.info;
    if (info.requiredHackingSkill <= ms.getHackingLevel() &&
        info.numOpenPortsRequired <= hackToolsHave.length)
      return 1
      else return 0
  }
  //["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe",
  //"SQLInject.exe"]
  getAccess() {
    if (!this.canHack) return false
      for (var i = 0; i < ms.getServerNumPortsRequired(this.host); ++i) {
        switch (hackToolsHave[i]) {
          case 'BruteSSH.exe':
            ms.brutessh(this.host);
            break;
          case 'FTPCrack.exe':
            ms.ftpcrack(this.host);
            break;
          case 'relaySMTP.exe':
            ms.relaysmtp(this.host);
            break;
          case 'HTTPWorm.exe':
            ms.httpworm(this.host);
            break;
          case 'SQLInject.exe':
            ms.sqlinject(this.host);
            break;
          default:
            ms.alert('!!! virus.exe error');
            ms.exit();
            break;
        }
      }
    ms.nuke(this.host);
    ms.disableLog('ALL')
    if (ms.hasRootAccess(this.host)) return true;
    else return false;
  }
}

class Tree {
  constructor(root) {
    ms.disableLog('ALL');
    this.root = root;
    this.nodeTraverse();
    this.myServers = {};
    this.myHosts = this.getMyServers();
    this.hosts = Object.keys(this.tree);
    this.length = this.hosts.length;
  }
  nodeTraverse() {
    var nodeptr = this.root;
    this.tree = {};
    this.accessedHosts = [];
    while (this.root.toDown.length != 0) {
      if (nodeptr.toDown.length > 0) {  // go down if toDown isn't empty
        nodeptr = new Node(nodeptr.toDown[0], nodeptr);
        this.tree[nodeptr.host] = nodeptr
        if (nodeptr.access) this.accessedHosts.push(nodeptr.host);
        // ms.print(">>> ", nodeptr.host, "\n=== toDown: ", nodeptr.toDown)
      } else {  // go up if toDown empty
        // ms.print("<<< ", nodeptr.host)
        nodeptr = nodeptr.up;
        nodeptr.toDown.splice(0, 1)  // remove the road just go up from
        // ms.print(">>> ", nodeptr.host, "\n=== toDown: ", nodeptr.toDown)
      }
    }
  }
  // return sorted hosts of mine, [descendin: 0 sort in ascending, 1 sort in
  // descending]
  getMyServers(descending = 1) {
    this.myServers = {};
    var myServerHosts = ms.getPurchasedServers(), rams = [];
    for (var i = 0; i < myServerHosts.length; ++i) {
      this.myServers[myServerHosts[i]] = new Node(myServerHosts[i], this.root);
      rams.push(ms.getServerMaxRam(myServerHosts[i]));
    }

    return this.myHosts = sort(rams, myServerHosts, descending);
  }
  sortAccessedHosts(descending = 1) {
    var moneys = [];
    for (var i = 0; i < this.accessedHosts.length; ++i) {
      var node = this.tree[this.accessedHosts[i]];
      moneys.push(node.maxMoney);
    }
    return sort(moneys, this.accessedHosts, descending);
  }
  getMap() {
    ms.tprint('>>> getMap()...');
    const file2wirte = 'map.txt';
    var strings = ''
    for (var i = 0; i < this.length; ++i) {
      var host = this.hosts[i], node = this.tree[host];
      for (var d = 1; d < node.distance; ++d) {
        strings += '| '
      }
      strings += host + (ms.hasRootAccess(host) ? ' (O)' : ' (X)') + ' -d' +
          node.distance + '\n'
    }
    ms.write(file2wirte, strings, 'w');
    ms.tprint('<<< map in ', file2wirte, ' has been writeen.')
  }

  hackAllNode() {
    ms.tprint('>>> hackAllNodes()...');
    var hacked = []
    ms.print('>>> All nodes access getting...')
    // ms.print(this.length);
    for (var i = 0; i < this.length; ++i) {
      var host = this.hosts[i], node = this.tree[host];
      if (node.canHack && !node.access) {
        ms.print('>>> ', host, ' access getting...');
        node.getAccess();
        this.accessedHosts.push(this.hosts[i])
        hacked.push(this.hosts[i]);
      }
    }
    ms.print('<<< Node accessed: ', hacked)
    ms.tprint('<<< hack node: ', hacked)
    return hacked;
  }

  outHostObj() {
    const accessedHosts = 'accessedHosts', myHost = 'myHosts',
          mine2accessed = 'mine2accessed', sourceHost = 'sourceHost',
          targetHost = 'targetHost';

    var arr_AH = this.sortAccessedHosts(), arr_MH = this.getMyServers(),
        arr_SH = this.myHosts, arr_TH = [];
    for (var i = 0; i < this.myHosts.length;
         ++i) {  // sourceHost.length=targetHost.length
      arr_TH.push(arr_AH[i]);
    }
    var obj = {
      [myHost]: arr_MH,
      [accessedHosts]: arr_AH,
      [mine2accessed]: {[sourceHost]: arr_SH, [targetHost]: arr_TH}
    };
    return obj;
  }

  writeHostObj() {
    ms.tprint('>>> writeHostObj()...');
    const file2write = 'hostsObj.script';
    var str = JSON.stringify(this.outHostObj());
    ms.write(file2write, str, 'w');
    ms.tprint('<<< hostObj in ', file2write, ' has been written.')
  }
}


async function purchaseMaxRamServer() {
  ms.tprint('>>> purchaseMaxRamServer()...');
  var infoArr = maxRamServerAfford();  //[ram, cost, index, next ram, next cost]
  ms.enableLog('ALL')
  var infoStr = 'Purchasing a server. ' +
      '(' + ms.getPurchasedServers().length + '/' +
      ms.getPurchasedServerLimit() + ')' +
      '\n=====Max\nram: ' + infoArr[0] + ' cost: ' + infoArr[1] +
      '\n=====Next\nram: ' + infoArr[3] + ' cost: ' + infoArr[4] +
      '\n\nMoney left: ' + moneyFix(ms.getServerMoneyAvailable('home'));

  if (await ms.prompt(infoStr))
    var purchased = ms.purchaseServer(infoArr[0], Math.pow(2, infoArr[2]));
  // ms.print(purchased);
  if (!purchased) {
    if (ms.getServerMoneyAvailable('home') <
        ms.getPurchasedServerCost(Math.pow(2, infoArr[2]))) {
      ms.tprint('<<< Not enough money');
      return false;
    } else {
      ms.tprint('<<< Purchasing cancalled');
      return false;
    }
  } else if (!ms.serverExists(purchased)) {
    ms.alert('!!! Server purchasing failed');
    ms.exit();
  }
  ms.disableLog('ALL');
  ms.tprint('<<< Server purchased: ', purchased)
  return true;

  function maxRamServerAfford() {
    var cost = ms.getPurchasedServerCost(Math.pow(2, 20));
    var myMoney = ms.getServerMoneyAvailable('home')
    var maxIndex = 20;
    for (var i = 19; i >= 0 && cost > myMoney;) {
      cost = ms.getPurchasedServerCost(Math.pow(2, i--));
      maxIndex = i + 1;
    }
    var nextIndex = maxIndex + 1 < 21 ? maxIndex + 1 : 20;
    // ms.print(maxIndex,"\n",ms.getPurchasedServerCost(Math.pow(2, maxIndex)))
    return [
      bitFix(Math.pow(2, maxIndex)), moneyFix(cost), maxIndex,
      bitFix(Math.pow(2, nextIndex)),
      moneyFix(ms.getPurchasedServerCost(Math.pow(2, nextIndex)))
    ];
  }
}



function server(host) {
  var server = ms.getServer(host)
  var str = '-----------------------------' +
      '\n=== name: ' + host +
      '\n=== hack skill: ' + server.requiredHackingSkill +
      '\n=== port need: ' + server.numOpenPortsRequired +
      '\n=== max money: ' + moneyFix(server.moneyMax) +
      '\n-----------------------------'
  return str;
}

function autoHack(targetHost) {}