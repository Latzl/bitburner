
import * as allin from './src/allin.js'
const settingFile = '/src/setting.script';
const hostsObjFile = '/src/hostsObj.script';
var files = [], myServers = [], setting;
/* auto attack target server according to args[0], automatically choose source
 * server that perform hack, grow, weaken */
export async function main(ns) {
  ns.clearLog();
  ns.disableLog('ALL')
  files = allin.getFiles(ns, '/src/attackFiles.script');  // hack grow weaken
  setting = JSON.parse(ns.read(settingFile)).autoAttack;
  getMyServer(ns);

  var targetHost = ns.args[0];
  var target = new Target(ns, targetHost);
  await target.cycle()
}

class Target {
  constructor(ns, targethost) {
    this.ns = ns;
    this.host = targethost;
    this.minSecurity = this.ns.getServerMinSecurityLevel(this.host);
    this.maxSecurity = 40;  // this.minSecurity * 2;
    this.maxMoney = this.ns.getServerMaxMoney(this.host);
    this.minMoney =
        setting.minMoneyFact * this.maxMoney;  // set threshold, too low would
                                               // make thread = -1 on hack;
    this.sourceHost = '';
    this.cores = 1;
    this.runTimes = [0, 0, 0]  //[hack,grow,weaken];
  }
  // return index of myServer if myServer maxRam allow, or return
  // [maxRam,maxRamIndex]
  selectMyServer(ram) {
    var maxRam = 0, maxRamIndex = 0;
    for (let i = 0; i < myServers.length; ++i) {
      if (!this.ns.fileExists(files[files.length - 1], myServers[i]))
        continue;  // deal with a new server do not receive copy in time;
      if (myServers[i] == 'home')  // remain 50GB for home;
        var remain = 15;
      else
        var remain = 0;
      if (this.ns.getServerMaxRam(myServers[i]) -
              this.ns.getServerUsedRam(myServers[i]) >
          maxRam + remain) {
        maxRam = this.ns.getServerMaxRam(myServers[i]) -
            this.ns.getServerUsedRam(myServers[i]) - remain;
        maxRamIndex = i;
      }
      if (maxRam > ram) return i;
    }
    return [maxRam, maxRamIndex];
  }
  // get and adjust info about thread,sourceHost before hack;
  infoPreHack() {
    this.ns.print('>>> infoPreHack() calling...');
    if (this.ns.getServerMoneyAvailable(this.host) < this.minMoney) {
      this.ns.print('<<< infoPreHack() out with: not enough money.');
      return -1;  // need grow
    }
    var finalSecurity, currSecurity, thread, ram, sourceHost;
    currSecurity = this.ns.getServerSecurityLevel(this.host);
    thread = Math.trunc(
        this.ns.hackAnalyzeThreads(this.host, this.maxMoney - this.minMoney));
    if (thread == -1) {
      this.ns.print('<<< infoPreHack() out with: thread = -1.');
      return -1;  // hack money=0;
    }
    finalSecurity =
        this.ns.hackAnalyzeSecurity(thread, this.host) + currSecurity;
    if (finalSecurity > this.maxSecurity)
      thread = this.reduceThread(thread, files[0]);
    if (thread > 0) {
      ram = this.ns.getScriptRam(files[0], 'home') * thread;
      var temp = this.selectMyServer(ram);
      if (Array.isArray(temp)) {
        thread = this.reduceThreadR(thread, files[0], temp[0])
        sourceHost = myServers[thread, files[0], temp[1]];
      } else {
        sourceHost = myServers[temp];
      }
    }
    this.sourceHost = sourceHost;
    finalSecurity =
        this.ns.hackAnalyzeSecurity(thread, this.host) + currSecurity;
    var outstr = '<<< infoPreHack() out with:\n- thread: ' + thread +
        ', sourceHost: ' + sourceHost + '\n- ram: ' +
        allin.bitFix(this.ns.getScriptRam(files[0], 'home') * thread) +
        ', security: ' + currSecurity.toFixed(2) + '-->' +
        finalSecurity.toFixed(2) + '/' + this.maxSecurity;
    this.ns.print(outstr);
    return thread;
  }
  // get and adjust info about thread,sourceHost before grow;
  infoPreGrow() {
    this.ns.print('>>> infoPreGrow() calling...');
    var currMoney, finalMoney, currSecurity, finalSecurity, thread, ram,
        sourceHost;
    currMoney = this.ns.getServerMoneyAvailable(this.host);
    if (currMoney >= this.maxMoney * 0.7) {
      this.ns.print('<<< infoPreGrow() out with: money enough.')
      return -1;
    }
    currSecurity = this.ns.getServerSecurityLevel(this.host);
    thread = Math.ceil(this.ns.growthAnalyze(
        this.host, this.maxMoney / currMoney, this.cores));
    finalSecurity =
        this.ns.growthAnalyzeSecurity(thread, this.host, this.cores) +
        currSecurity;

    if (thread > 0) {
      ram = this.ns.getScriptRam(files[1], 'home') * thread;
      var temp = this.selectMyServer(ram);
      if (Array.isArray(temp)) {
        thread = this.reduceThreadR(thread, files[1], temp[0])
        sourceHost = myServers[thread, files[1], temp[1]];
      } else {
        sourceHost = myServers[temp];
      }
    }
    this.sourceHost = sourceHost;
    finalSecurity =
        this.ns.growthAnalyzeSecurity(thread, this.host, this.cores) +
        currSecurity;
    var outstr = '<<< infoPreGrow() out with:' +
        '\n- thread: ' + thread + ', sourceHost: ' + sourceHost + '\n- ram: ' +
        allin.bitFix(this.ns.getScriptRam(files[1], 'home') * thread) +
        ', security: ' + currSecurity.toFixed(2) + '-->' +
        finalSecurity.toFixed(2) + '/' + this.maxSecurity;
    this.ns.print(outstr);
    return thread;
  }
  infoPreWeaken() {
    this.ns.print('>>> infoPreWeaken() calling...');
    var finalSecurity, currSecurity, thread, ram, sourceHost;
    currSecurity = this.ns.getServerSecurityLevel(this.host);
    if (currSecurity <
        this.minSecurity + (this.maxSecurity - this.minSecurity) * 0.7) {
      this.ns.print('<<< infoPreWeaken() out with: security low enough.')
      return -1;
    }
    thread = this.getWeakenThread();
    ram = this.ns.getScriptRam(files[2], 'home') * thread;
    var temp = this.selectMyServer(ram);
    if (Array.isArray(temp)) {
      thread = this.reduceThreadR(thread, files[2], temp[0])
      sourceHost = myServers[thread, files[2], temp[1]];
    } else {
      sourceHost = myServers[temp];
    }
    this.sourceHost = sourceHost;
    finalSecurity = currSecurity - this.ns.weakenAnalyze(thread, this.cores);
    var outstr = '<<< infoPreWeaken() out with:\n- thread: ' + thread +
        ', sourceHost: ' + sourceHost + '\n- ram: ' +
        allin.bitFix(this.ns.getScriptRam(files[1], 'home') * thread) +
        ', security: ' + currSecurity.toFixed(2) + '-->' +
        finalSecurity.toFixed(2) + '/' + this.maxSecurity;
    this.ns.print(outstr);
    return thread;
  }

  getWeakenThread() {
    var thread = 0, currSecurity = this.ns.getServerSecurityLevel(this.host);
    while (currSecurity - this.ns.weakenAnalyze(++thread, this.cores) >=
           this.minSecurity)
      ;
    return thread;
  }
  // reduce thread due to security;
  reduceThread(thread, action) {
    this.ns.print('>>> reducing thread due to security');
    var finalSecurity, currSecurity = this.ns.getServerSecurityLevel(this.host);
    do {
      switch (action) {
        case files[0]:
          finalSecurity =
              currSecurity + this.ns.hackAnalyzeSecurity(--thread, this.host);
          break;
        case files[1]:
          finalSecurity = currSecurity +
              this.ns.growthAnalyzeSecurity(--thread, this.host, this.cores);
          break;
        default:
          break;
      }
    } while (thread > 0 && finalSecurity >= this.maxSecurity);
    this.ns.print(
        '<<< reduced to: ', thread,
        ', finalSecurity: ', finalSecurity.toFixed(2));
    return thread;
  }
  // reduce thread due to maxRam
  reduceThreadR(thread, action, maxRam) {
    var ramCost;
    this.ns.print('>>> reducing thread due to maxRam');
    while ((ramCost = this.ns.getScriptRam(action, 'home') * --thread) >=
               maxRam &&
           thread > 0)
      ;
    this.ns.print(
        '<<< reduced to: ', thread, ', ram cost: ', allin.bitFix(ramCost));
    return thread;
  }

  async waite4complet() {
    const port = 1;
    this.ns.print('>>> waite4complet() calling...');
    var inPort;
    do {
      inPort = this.ns.peek(port);
      await this.ns.sleep(200);
    } while (inPort == 'NULL PORT DATA' ||
             !(JSON.parse(inPort).targetHost == this.host &&
               JSON.parse(inPort).sourceHost == this.sourceHost));
    this.ns.readPort(port);
    this.ns.print('<<< waite4complet() out');
  }

  async cycle() {
    var thread;
    for (let i = 0; i < myServers.length; ++i) {
      for (let act = 0; act < files.length; ++act) {
        if (this.ns.isRunning(files[act], myServers[i], this.host))
          this.ns.kill(files[act], myServers[i], this.host);
      }
    }
    while (true) {
      if ((thread = this.infoPreHack()) > 0) await this.execAction(0, thread);
      if ((thread = this.infoPreGrow()) > 0) await this.execAction(1, thread);
      if ((thread = this.infoPreWeaken()) > 0) await this.execAction(2, thread);

      getMyServer(this.ns);  // refresh server list to be sourceHost;
      await this.ns.sleep(1);
    }
  }
  // main action;
  async execAction(act, thread) {
    this.ns.print('>>> excAction() calling...');
    ++this.runTimes[act];
    this.ns.exec(files[act], this.sourceHost, thread, this.host);
    this.ns.print(this.info2Log(files[act]));
    await this.waite4complet();
    this.ns.print('<<< excAction() out.');
  }

  info2Log(file) {
    var costTime, act, runTimes, outStr;
    switch (file) {
      case files[0]:
        costTime = this.ns.getHackTime(this.host);
        act = 'hack';
        runTimes = this.runTimes[0];
        break;
      case files[1]:
        costTime = this.ns.getGrowTime(this.host);
        act = 'grow';
        runTimes = this.runTimes[1];
        break;
      case files[2]:
        costTime = this.ns.getWeakenTime(this.host);
        act = 'weaken';
        runTimes = this.runTimes[2];
        break;
      default:
        this.ns.print('!!! error file on: info2Log()');
        break;
    }
    costTime = (costTime / 60000).toFixed(0) + 'm' +
        (costTime / 1000 % 60).toFixed(1) + 's';
    outStr = '----------------------------------------' +
        '\n||  ' + this.sourceHost + ' --> ' + this.host +
        '\n||  action: ' + act + ', run times: ' + runTimes +
        '\n||  time cost: ' + costTime + '\n||  money: ' +
        allin.moneyFix(this.ns.getServerMoneyAvailable(this.host)) + '/' +
        allin.moneyFix(this.maxMoney) + '\n||  security: ' +
        this.ns.getServerSecurityLevel(this.host).toFixed(2) + ' ~ [' +
        this.minSecurity.toFixed(2) + ', ' + this.maxSecurity + ')' +
        '\n||  Hack chance: ' +
        (this.ns.hackAnalyzeChance(this.host) * 100).toFixed(2) + '%' +
        '\n----------------------------------------';
    return outStr;
  }
}

function getMyServer(ns) {
  let hostsObj = JSON.parse(ns.read(hostsObjFile));
  myServers = hostsObj.ramHosts;
}